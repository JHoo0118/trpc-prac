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

  // ctx는 tRPC 요청의 컨텍스트로, 서버에서 프로시저를 실행할 때 필요한 추가 정보(예: 사용자 정보, 요청 메타데이터)를 포함합니다.
  // input은 클라이언트가 프로시저에 전달한 입력 데이터
  // ctx = {
  //   user: {
  //     password: "$2b$10$...", // 해시된 비밀번호
  //     email: "old@example.com",
  //   },
  //   req: { ... }, // HTTP 요청 객체
  //   db: { ... }, // Drizzle DB 인스턴스
  // };
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
