import { db } from "../db/index.js";
import { polls, questions, options, responses, answers } from "../db/schema.js";
import { eq, count } from "drizzle-orm";
import { ApiError } from "../utils/ApiError.js";
import type { CreatePollDTO } from "../common/DTO/poll.dto.js";
import type { Option } from "../db/schema.js";

export const createPoll = async (clerkUserId: string, data: CreatePollDTO) => {
  return await db.transaction(async (tx) => {
    // returning() gives an array -> destructure safely with a guard
    const insertedPolls = await tx
      .insert(polls)
      .values({
        creatorId: clerkUserId,
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        expiresAt: new Date(data.expiresAt),
      })
      .returning();

    const poll = insertedPolls[0];
    if (!poll) throw new ApiError(500, "Failed to create poll");

    for (const q of data.questions) {
      const insertedQuestions = await tx
        .insert(questions)
        .values({
          pollId: poll.id,
          questionText: q.questionText,
          isMandatory: q.isMandatory,
          displayOrder: q.displayOrder,
        })
        .returning();

      const question = insertedQuestions[0];
      if (!question) throw new ApiError(500, "Failed to create question");

      await tx.insert(options).values(
        q.options.map((opt) => ({
          questionId: question.id,
          optionText: opt.optionText,
          displayOrder: opt.displayOrder,
        }))
      );
    }

    return poll;
  });
};

export const getPollsByCreator = async (clerkUserId: string) => {
  return db.select().from(polls).where(eq(polls.creatorId, clerkUserId));
};

export const getPollById = async (pollId: string) => {
  const poll = await db.query.polls.findFirst({
    where: eq(polls.id, pollId),
    with: {
      questions: {
        with: { options: true },
        orderBy: (q, { asc }) => [asc(q.displayOrder)], 
      },
    },
  });
  return poll ?? null;
};

export const publishPoll = async (pollId: string, clerkUserId: string) => {
  const poll = await getPollById(pollId);
  if (!poll) throw new ApiError(404, "Poll not found");
  if (poll.creatorId !== clerkUserId) throw new ApiError(403, "Forbidden");

  const updated = await db
    .update(polls)
    .set({ isPublished: true })
    .where(eq(polls.id, pollId))
    .returning();

  const result = updated[0];
  if (!result) throw new ApiError(500, "Failed to publish poll");
  return result;
};

export const getPublishedResults = async (pollId: string) => {
  const poll = await db.query.polls.findFirst({
    where: eq(polls.id, pollId),
    with: {
      questions: {
        with: { options: true },
        orderBy: (q, { asc }) => [asc(q.displayOrder)],
      },
    },
  });

  if (!poll)            throw new ApiError(404, "Poll not found");
  if (!poll.isPublished) throw new ApiError(403, "Results have not been published yet");

  // reuse the same analytics calculation inline
  const totalResult = await db
    .select({ count: count() })
    .from(responses)
    .where(eq(responses.pollId, pollId));

  const totalResponses = Number(totalResult[0]?.count ?? 0);

  const optionCounts = await db
    .select({ optionId: answers.selectedOptionId, count: count() })
    .from(answers)
    .innerJoin(responses, eq(answers.responseId, responses.id))
    .where(eq(responses.pollId, pollId))
    .groupBy(answers.selectedOptionId);

  const countMap: Record<string, number> = Object.fromEntries(
    optionCounts.map((r) => [r.optionId, Number(r.count)])
  );

  return {
    pollId,
    title:           poll.title,
    totalResponses,
    questions: poll.questions.map((q) => ({
      questionId:   q.id,
      questionText: q.questionText,
      options: (q as typeof q & { options: Option[] }).options.map((opt) => ({
        optionId:   opt.id,
        optionText: opt.optionText,
        count:      countMap[opt.id] ?? 0,
        percentage: totalResponses > 0
          ? Math.round(((countMap[opt.id] ?? 0) / totalResponses) * 100)
          : 0,
      })),
    })),
  };
};

export const deletePoll = async (pollId: string, clerkUserId: string) => {
  const poll = await getPollById(pollId);
  if (!poll) throw new ApiError(404, "Poll not found");
  if (poll.creatorId !== clerkUserId) throw new ApiError(403, "Forbidden");
  await db.delete(polls).where(eq(polls.id, pollId));
};