import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { join } from "path";

import { authRouter } from "./features/auth/router";
import { commentRouter } from "./features/comment/router";
import { experienceRouter } from "./features/experience/router";
import { notificationRouter } from "./features/notification/router";
import { tagRouter } from "./features/tag/router";
import { userRouter } from "./features/user/router";
import { createContext, router } from "./trpc";
import { env } from "./utils/env";

const appRouter = router({
  auth: authRouter,
  comments: commentRouter,
  experiences: experienceRouter,
  notifications: notificationRouter,
  tags: tagRouter,
  users: userRouter,
});
export type AppRouter = typeof appRouter;

const app = express();

app.use(cookieParser());

app.use((req, res, next) => {
  setTimeout(next, Math.floor(Math.random() * 1000 + 100));
});

app.use(
  cors({
    origin: env.CLIENT_BASE_URL,
    credentials: true,
  }),
);

app.use("/uploads", express.static(join(process.cwd(), "public", "uploads")));

app.use(
  "/",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(3000);
