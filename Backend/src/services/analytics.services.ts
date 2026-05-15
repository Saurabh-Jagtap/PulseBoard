import { db } from "../db/index.js";
import { polls, responses, answers } from "../db/schema.js";
import { eq, count } from "drizzle-orm";
import { ApiError } from "../utils/ApiError.js";
import type { Question, Option } from "../db/schema.js";

export const getAnalytics = async (pollId: string, clerkUserId: string) => {
  const poll = await db.query.polls.findFirst({
    where: eq(polls.id, pollId),
    with: {
      questions: {
        with: { options: true },
        orderBy: (q, { asc }) => [asc(q.displayOrder)], 
      },
    },
  });

  if (!poll) throw new ApiError(404, "Poll not found");
  if (poll.creatorId !== clerkUserId) throw new ApiError(403, "Forbidden");

  // total responses -> count() returns a string from Postgres, convert it to number
  const totalResult = await db
    .select({ totalResponses: count() })
    .from(responses)
    .where(eq(responses.pollId, pollId));

  // guard against empty result (shouldn't happen but TS requires it)
  const totalResponses = Number(totalResult[0]?.totalResponses ?? 0);

  // per-option vote counts
  const optionCounts = await db
    .select({
      optionId: answers.selectedOptionId,
      count: count(),
    })
    .from(answers)
    .innerJoin(responses, eq(answers.responseId, responses.id))
    .where(eq(responses.pollId, pollId))
    .groupBy(answers.selectedOptionId);

  // build a lookup map: optionId → vote count
  const countMap: Record<string, number> = Object.fromEntries(
    optionCounts.map((row) => [row.optionId, Number(row.count)])
  );

  // shape the analytics response
  const questionSummaries = poll.questions.map((q) => ({
    questionId: q.id,
    questionText: q.questionText,
    isMandatory: q.isMandatory,
    options: q.options.map((opt) => ({
      optionId: opt.id,
      optionText: opt.optionText,
      count: countMap[opt.id] ?? 0,
      percentage:
        totalResponses > 0
          ? Math.round(((countMap[opt.id] ?? 0) / totalResponses) * 100)
          : 0,
    })),
  }));

  return {
    pollId,
    title: poll.title,
    totalResponses,
    isPublished: poll.isPublished,
    expiresAt: poll.expiresAt,
    questions: questionSummaries,
  };
};