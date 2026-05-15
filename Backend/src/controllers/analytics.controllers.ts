import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as analyticsService from "../services/analytics.services.js";
import { getAuth } from "@clerk/express";
import { ApiError } from "../utils/ApiError.js";

const getPollId = (req: Request): string => {
  const { pollId } = req.params;

  if (typeof pollId !== "string") {
    throw new ApiError(400, "Poll ID is required");
  }

  return pollId;
};

export const getAnalytics =
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuth(req);
    if (!userId) throw new ApiError(401, "Unauthorized");

    const pollId = getPollId(req);

    const data = await analyticsService.getAnalytics(
      pollId,
      userId
    );
    res.status(200).json(new ApiResponse(200, data));
  }
