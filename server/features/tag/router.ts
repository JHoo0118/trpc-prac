import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../database";
import { tagsTable } from "../../database/schema";
import { publicProcedure, router } from "../../trpc";
import { tagSelectSchema } from "./models";

export const tagRouter = router({
  list: publicProcedure.output(z.array(tagSelectSchema)).query(async () => {
    return db.query.tagsTable.findMany({
      orderBy: desc(tagsTable.name),
    });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .output(tagSelectSchema)
    .query(async ({ input }) => {
      const tag = await db.query.tagsTable.findFirst({
        where: eq(tagsTable.id, input.id),
      });

      if (!tag) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tag not found" });
      }

      return tag;
    }),
});
