import { Router } from "express";
import { handleWebhook } from "../controllers/webhook.controllers.js";

const router: Router = Router();

// raw body is required for svix signature verification
// this route must be mounted BEFORE express.json() in app.ts
router.post("/", handleWebhook);

export default router;