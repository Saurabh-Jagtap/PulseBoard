import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { getAnalytics } from "../controllers/analytics.controllers.js";

const router: Router = Router();

router.get("/:pollId", requireAuth, getAnalytics);

export default router;