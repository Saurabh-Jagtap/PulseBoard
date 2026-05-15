import { Router } from "express";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { validate } from "../middlewares/validate.js";
import { submitResponseSchema } from "../common/DTO/response.dto.js";
import { submitResponse } from "../controllers/response.controllers.js";

const router:Router = Router();

// optionalAuth -> works for both anonymous and authenticated users
router.post("/:pollId", optionalAuth, validate(submitResponseSchema), submitResponse);

export default router;