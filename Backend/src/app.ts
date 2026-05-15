import "dotenv/config";
import express, { type Request, type Response, type NextFunction, type Application } from "express";
import cors from "cors";
import pollRoutes from "./routes/poll.routes.js";
import responseRoutes from "./routes/response.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { ApiError } from "./utils/ApiError.js";
import { clerkMiddleware } from '@clerk/express'
import userRoutes from "./routes/user.routes.js"

const app:Application = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(clerkMiddleware())

app.use("/api/users", userRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/respond", responseRoutes);
app.use("/api/analytics", analyticsRoutes);

// health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export { app };