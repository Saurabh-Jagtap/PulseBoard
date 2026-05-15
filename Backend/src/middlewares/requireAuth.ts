import { clerkMiddleware, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

// Step 1 — Clerk's own middleware that parses and verifies the token
// This attaches req.auth to the request object
export const clerkInit: RequestHandler = clerkMiddleware();

// Step 2 — our guard that runs after clerkInit
// Checks if the user is actually authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const { userId } = getAuth(req);

  if (!userId) {
    return next(new ApiError(401, "Unauthorized — please sign in"));
  }

  next();
};