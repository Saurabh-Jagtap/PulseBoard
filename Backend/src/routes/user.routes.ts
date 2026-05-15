import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { syncUser } from "../controllers/user.controller.js";

const router: Router = Router();

router.post("/sync", requireAuth, syncUser);

export default router;