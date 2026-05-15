import type { Request, Response, NextFunction } from "express";
import type { ZodObject } from "zod";
import { ApiError } from "../utils/ApiError.js";

// augment Express Request so req.validatedData is typed
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
    }
  }
}

const validate =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new ApiError(422, "Validation failed", errors));
    }

    req.validatedData = result.data;
    next();
  };

export { validate };