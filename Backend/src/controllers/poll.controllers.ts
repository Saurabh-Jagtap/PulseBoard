import type { Request, Response } from "express";
import type { CreatePollDTO } from "../common/DTO/poll.dto.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as pollService from "../services/poll.services.js";
import { getAuth } from "@clerk/express";

const getPollId = (req: Request): string => {
  const { pollId } = req.params;

  if (typeof pollId !== "string") {
    throw new ApiError(400, "Poll ID is required");
  }

  return pollId;
};

export const createPoll = async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);  
  if (!userId) throw new ApiError(401, "Unauthorized");

  const data = req.validatedData as CreatePollDTO;
  const poll = await pollService.createPoll(userId, data);
  res.status(201).json(new ApiResponse(201, poll, "Poll created"));
}

export const getMyPolls = async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);  
  if (!userId) throw new ApiError(401, "Unauthorized");

  const polls = await pollService.getPollsByCreator(userId);
  res.status(200).json(new ApiResponse(200, polls));
}


export const getPollById = async (req: Request, res: Response): Promise<void> => {
  const pollId = getPollId(req);

  const poll = await pollService.getPollById(pollId);
  if (!poll) throw new ApiError(404, "Poll not found");
  res.status(200).json(new ApiResponse(200, poll));
}


export const publishPoll = async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);  
  if (!userId) throw new ApiError(401, "Unauthorized");

  const pollId = getPollId(req);

  const poll = await pollService.publishPoll(
    pollId,
    userId
  );
  res.status(200).json(new ApiResponse(200, poll, "Poll published"));
}


export const getPublishedResults = async (req: Request, res: Response): Promise<void> => {
  const pollId = getPollId(req);

  const result = await pollService.getPublishedResults(pollId);
  res.status(200).json(new ApiResponse(200, result));
}


export const deletePoll = async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);  
  if (!userId) throw new ApiError(401, "Unauthorized");

  const pollId = getPollId(req);

  await pollService.deletePoll(pollId, userId);
  res.status(200).json(new ApiResponse(200, null, "Poll deleted"));
}
