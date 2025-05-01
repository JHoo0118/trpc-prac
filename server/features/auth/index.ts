import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../../utils/env";

const SALT_ROUNDS = 12;

export const tokenPayloadSchema = z.object({
  userId: z.number().optional(),
  refreshToken: z.string().optional(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

export const auth = {
  hashPassword: (password: string) => {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  verifyPassword: (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
  },

  createToken: (payload: TokenPayload, options: jwt.SignOptions) => {
    return jwt.sign(payload, env.AUTH_SECRET, options);
  },

  verifyToken: (token: string, options?: jwt.VerifyOptions) => {
    try {
      return jwt.verify(token, env.AUTH_SECRET, options) as TokenPayload;
    } catch {
      return false;
    }
  },
};
