import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----- Users ------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----- Polls ------

export const polls = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: text("creator_id").notNull(),   // Clerk userId string
  title: text("title").notNull(),
  description: text("description"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----- Questions ------

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .notNull()
    .references(() => polls.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  isMandatory: boolean("is_mandatory").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
});

// ----- Options ------

export const options = pgTable("options", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  optionText: text("option_text").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
});

// ----- Responses ------

export const responses = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .notNull()
    .references(() => polls.id, { onDelete: "cascade" }),
  respondentId: text("respondent_id"),         // null = anonymous
  sessionToken: text("session_token"),         // for anon duplicate prevention
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// ----- Answers ------

export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id")
    .notNull()
    .references(() => responses.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  selectedOptionId: uuid("selected_option_id")
    .notNull()
    .references(() => options.id, { onDelete: "cascade" }),
});

// ----- Relations (needed for db.query.*.findFirst({ with: {} }) to work) -----

export const pollsRelations = relations(polls, ({ many }) => ({
  questions: many(questions),
  responses: many(responses),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  poll: one(polls, { fields: [questions.pollId], references: [polls.id] }),
  options: many(options),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, { fields: [options.questionId], references: [questions.id] }),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  poll: one(polls, { fields: [responses.pollId], references: [polls.id] }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  response: one(responses, { fields: [answers.responseId], references: [responses.id] }),
  question: one(questions, { fields: [answers.questionId], references: [questions.id] }),
  option: one(options, { fields: [answers.selectedOptionId], references: [options.id] }),
}));

// ----- Inferred Types ------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;

export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;