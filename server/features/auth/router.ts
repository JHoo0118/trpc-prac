import {
  changeEmailSchema,
  changePasswordSchema,
  userCredentialsSchema,
} from "@advanced-react/shared/schema/auth";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../database";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { auth } from "./index";
import { userSelectSchema, usersTable } from "./models";

export const authRouter = router({
  register: publicProcedure
    .input(userCredentialsSchema)
    .output(
      z.object({
        accessToken: z.string(),
        user: userSelectSchema.omit({ password: true }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, input.email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This email is already registered. Please try logging in instead.",
        });
      }

      const hashedPassword = await auth.hashPassword(input.password);
      const now = new Date().toISOString();

      const users = await db
        .insert(usersTable)
        .values({
          name: input.name,
          email: input.email,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const refreshToken = auth.createToken(
        { userId: users[0].id },
        { expiresIn: "7d" },
      );

      ctx.res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const accessToken = auth.createToken(
        { refreshToken },
        { expiresIn: "15m" },
      );

      return { accessToken, user: users[0] };
    }),

  login: publicProcedure
    .input(userCredentialsSchema.omit({ name: true }))
    .output(
      z.object({
        accessToken: z.string(),
        user: userSelectSchema.omit({ password: true }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, input.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password. Please try again.",
        });
      }

      const isValid = await auth.verifyPassword(input.password, user.password);

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password. Please try again.",
        });
      }

      const refreshToken = auth.createToken(
        { userId: user.id },
        { expiresIn: "7d" },
      );

      ctx.res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const accessToken = auth.createToken(
        { refreshToken },
        { expiresIn: "15m" },
      );

      return { accessToken, user };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie("refreshToken");
    return;
  }),

  currentUser: publicProcedure
    .output(
      z.object({
        accessToken: z.string().nullable(),
        currentUser: userSelectSchema.omit({ password: true }).nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        return { accessToken: null, currentUser: null };
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...cleanUser } = ctx.user;

      return { accessToken: ctx.accessToken, currentUser: cleanUser };
    }),

  changeEmail: protectedProcedure
    .input(changeEmailSchema)
    .mutation(async ({ ctx, input }) => {
      const isPasswordValid = await auth.verifyPassword(
        input.password,
        ctx.user.password,
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid password",
        });
      }

      await db
        .update(usersTable)
        .set({ email: input.email, updatedAt: new Date().toISOString() })
        .where(eq(usersTable.id, ctx.user.id));

      return { success: true };
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const isPasswordValid = await auth.verifyPassword(
        input.currentPassword,
        ctx.user.password,
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid password",
        });
      }

      const hashedPassword = await auth.hashPassword(input.newPassword);

      await db
        .update(usersTable)
        .set({ password: hashedPassword, updatedAt: new Date().toISOString() })
        .where(eq(usersTable.id, ctx.user.id));

      return { success: true };
    }),
});
