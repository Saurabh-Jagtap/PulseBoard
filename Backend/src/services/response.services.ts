import { db } from "../db/index.js";
import { responses, answers, polls, users } from "../db/schema.js";
import { eq, and, count } from "drizzle-orm";
import { ApiError } from "../utils/ApiError.js";
import type { SubmitResponseDTO } from "../common/DTO/response.dto.js";
import type { Question } from "../db/schema.js";
import { emitNewResponse } from "../socket/index.js";


export const submitResponse = async (
  pollId: string,
  data: SubmitResponseDTO,
  clerkUserId: string | null
) => {
  // 1. fetching poll with questions + options
  const poll = await db.query.polls.findFirst({
    where: eq(polls.id, pollId),
    with: {
      questions: {
        with: { options: true },
      },
    },
  });

  if (!poll) throw new ApiError(404, "Poll not found");

  // 2. expiry check
  if (!poll.isActive || new Date() > poll.expiresAt)
    throw new ApiError(410, "This poll has expired");

  // 3. ----- AUTH MODE ENFORCEMENT -----
  // If the poll does NOT allow anonymous responses, the user MUST be logged in
  if (!poll.isAnonymous && !clerkUserId) {
    throw new ApiError(
      401,
      "This poll requires you to sign in before responding"
    );
  }

  // NEW: If we have a clerkUserId, verify they exist in our users table.
  // Handles the case where the user was deleted from our DB but their
  // Clerk session token is still technically valid.
  if (clerkUserId) {
    const userExists = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
      columns: { id: true }, // only fetch what we need — keep it cheap
    });

    if (!userExists) {
      throw new ApiError(
        403,
        "Your account no longer exists. Please sign up again."
      );
    }
  }

  // 4. ----- MANDATORY QUESTION VALIDATION (backend) -----
  // Build a complete map of this poll's questions
  const pollQuestionMap = new Map(
    poll.questions.map((q) => ({
      id: q.id,
      isMandatory: q.isMandatory,
      optionIds: (q as typeof q & { options: { id: string }[] }).options.map(
        (o) => o.id
      ),
    })).map((q) => [q.id, q])
  );

  // Check: every questionId in the answers actually belongs to this poll
  for (const answer of data.answers) {
    if (!pollQuestionMap.has(answer.questionId)) {
      throw new ApiError(
        422,
        `Question "${answer.questionId}" does not belong to this poll`
      );
    }
  }

  // Check: every mandatory question has an answer
  const answeredQuestionIds = new Set(data.answers.map((a) => a.questionId));

  const unansweredMandatory = poll.questions.filter(
    (q: Question) => q.isMandatory && !answeredQuestionIds.has(q.id)
  );

  if (unansweredMandatory.length > 0) {
    const labels = unansweredMandatory
      .map((q: Question) => `"${q.questionText}"`)
      .join(", ");
    throw new ApiError(
      422,
      `Please answer all required questions: ${labels}`
    );
  }

  // Check: optional questions that ARE answered must have valid answers
  // (no extra questions that don't belong to this poll slipping through)
  for (const answer of data.answers) {
    const question = pollQuestionMap.get(answer.questionId)!;

    // selectedOptionId must belong to the question it claims to answer
    if (!question.optionIds.includes(answer.selectedOptionId)) {
      throw new ApiError(
        422,
        `Option "${answer.selectedOptionId}" does not belong to the specified question`
      );
    }
  }

  // Check: no duplicate question answers in the same submission
  if (answeredQuestionIds.size !== data.answers.length) {
    throw new ApiError(
      422,
      "Each question can only be answered once per submission"
    );
  }

  // 5. ----- DUPLICATE SUBMISSION PREVENTION -----
  if (clerkUserId) {
    // authenticated: check by userId
    const existing = await db.query.responses.findFirst({
      where: and(
        eq(responses.pollId, pollId),
        eq(responses.respondentId, clerkUserId)
      ),
    });
    if (existing)
      throw new ApiError(409, "You have already responded to this poll");
  } else {
    // anonymous: MUST have a sessionToken (already enforced by DTO)
    if (!data.sessionToken)
      throw new ApiError(400, "Session token required for anonymous responses");

    const existing = await db.query.responses.findFirst({
      where: and(
        eq(responses.pollId, pollId),
        eq(responses.sessionToken, data.sessionToken)
      ),
    });
    if (existing)
      throw new ApiError(409, "You have already responded to this poll");
  }

  // 6. ----- SAVE RESPONSE + ANSWERS IN ONE TRANSACTION -----
  const savedResponse = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(responses)
      .values({
        pollId,
        respondentId: clerkUserId,
        sessionToken: data.sessionToken ?? null,
      })
      .returning();

    const response = inserted[0];
    if (!response) throw new ApiError(500, "Failed to record response");

    await tx.insert(answers).values(
      data.answers.map((a) => ({
        responseId: response.id,
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
      }))
    );

    return response;
  });

  // 7. ----- EMIT SOCKET EVENT AFTER COMMIT -----
  const countResult = await db
    .select({ count: count() })
    .from(responses)
    .where(eq(responses.pollId, pollId));

  emitNewResponse(pollId, {
    totalResponses: Number(countResult[0]?.count ?? 0),
  });

  return savedResponse;
};