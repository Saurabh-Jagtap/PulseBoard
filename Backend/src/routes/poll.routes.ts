import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { createPollSchema } from "../common/DTO/poll.dto.js";
import {
  createPoll,
  getMyPolls,
  getPollById,
  publishPoll,
  deletePoll,
  getPublishedResults,
} from "../controllers/poll.controllers.js";

const router:Router = Router();

router.post("/", requireAuth, validate(createPollSchema), createPoll);
router.get("/", requireAuth, getMyPolls);
router.get("/:pollId", getPollById);  // public
router.get("/:pollId/results", getPublishedResults);   // public
router.patch("/:pollId/publish", requireAuth, publishPoll);
router.delete("/:pollId", requireAuth, deletePoll);

export default router;