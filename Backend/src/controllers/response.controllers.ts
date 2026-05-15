import type { Request, Response } from "express";

import type { SubmitResponseDTO } from "../common/DTO/response.dto.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as responseService from "../services/response.services.js";
import { getAuth } from "@clerk/express";
import { ApiError } from "../utils/ApiError.js";

const getPollId = (req: Request): string => {
  const { pollId } = req.params;

  if (typeof pollId !== "string") {
    throw new ApiError(400, "Poll ID is required");
  }

  return pollId;
};

export const submitResponse = 
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuth(req);
    const data = req.validatedData as SubmitResponseDTO;
    const pollId = getPollId(req);

    // userId is undefined for anonymous users
    const result = await responseService.submitResponse(
      pollId,
      data,
      userId ?? null
    );
    res.status(201).json(new ApiResponse(201, result, "Response submitted"));
  }
