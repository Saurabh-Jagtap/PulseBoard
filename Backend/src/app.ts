import "dotenv/config";
import express, { type Request, type Response, type NextFunction, type Application } from "express";
import cors from "cors";
import pollRoutes from "./routes/poll.routes.js";
import responseRoutes from "./routes/response.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { ApiError } from "./utils/ApiError.js";
import { clerkMiddleware } from '@clerk/express'
import userRoutes from "./routes/user.routes.js"
import webhookRoutes from "./routes/webhook.routes.js";

const app:Application = express();

const allowedOrigins = [
  'https://pulseboard.saurabhjagtap.tech',  // custom production domain
  'https://pulse-board-saurabhworkspace123-8359s-projects.vercel.app', // Production
  'https://pulse-board-10ddcaqjy-saurabhworkspace123-8359s-projects.vercel.app',
  'http://localhost:5173' // Local development
];

app.use(cors({ 
  // origin: process.env.CLIENT_URL,
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isVercelPreview = origin.endsWith('vercel.app');
    const isAllowed = allowedOrigins.indexOf(origin) !== -1;

    if (isAllowed || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

// Webhook route MUST come before express.json() 
// express.json() consumes the raw body svix needs it unconsumed
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),  // parse as raw Buffer
  webhookRoutes
);

// health check
app.get("/health", (req: Request, res: Response) => res.json({ status: "ok" }));

app.use(express.json());
app.use(clerkMiddleware())

app.use("/api/users", userRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/respond", responseRoutes);
app.use("/api/analytics", analyticsRoutes);


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