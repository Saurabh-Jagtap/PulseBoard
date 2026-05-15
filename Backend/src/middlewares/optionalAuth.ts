import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  // getAuth won't throw if no token — it just returns { userId: null }
  // clerkInit in app.ts already ran so req.auth is populated if token exists
  getAuth(req); // no-op if no token, but ensures req.auth shape is consistent
  next();
};