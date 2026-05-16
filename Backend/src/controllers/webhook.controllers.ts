import type { Request, Response } from "express";
import { Webhook } from "svix";
import { db } from "../db/index.js";
import { users, polls, responses } from "../db/schema.js";
import { eq } from "drizzle-orm";

// ── Clerk event shapes ────────────────────────────────────────

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserCreatedEvent {
  type: "user.created";
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string;
  };
}

interface ClerkUserUpdatedEvent {
  type: "user.updated";
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string;
  };
}

interface ClerkUserDeletedEvent {
  type: "user.deleted";
  data: {
    id?: string;       // can be undefined in some Clerk admin flows
    deleted: boolean;
  };
}

type ClerkWebhookEvent =
  | ClerkUserCreatedEvent
  | ClerkUserUpdatedEvent
  | ClerkUserDeletedEvent
  | { type: string; data: unknown };

// ── Helper to extract primary email ──────────────────────────

function getPrimaryEmail(
  emailAddresses: ClerkEmailAddress[],
  primaryId: string
): string {
  return (
    emailAddresses.find((e) => e.id === primaryId)?.email_address ??
    emailAddresses[0]?.email_address ??
    ""
  );
}

function getFullName(first: string | null, last: string | null): string {
  return [first, last].filter(Boolean).join(" ") || "Unknown";
}

// ----- Controller -----

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  console.log("[Webhook] Hit received", {
    contentType: req.headers["content-type"],
    hasSvixId: !!req.headers["svix-id"],
    bodyType: typeof req.body,
    isBuffer: Buffer.isBuffer(req.body),
    bodyLength: Buffer.isBuffer(req.body) ? req.body.length : "not a buffer",
    secret: !!process.env.CLERK_WEBHOOK_SECRET,
  });
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  const svixId        = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: "Missing svix headers" });
    return;
  }

  const body = (req.body as Buffer).toString("utf8");
  let event: ClerkWebhookEvent;

  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(body, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  // ----- user.created -----
  if (event.type === "user.created") {
    const { id, first_name, last_name, email_addresses, primary_email_address_id } =
      (event as ClerkUserCreatedEvent).data;

    const email = getPrimaryEmail(email_addresses, primary_email_address_id);
    const name  = getFullName(first_name, last_name);

    try {
      await db
        .insert(users)
        .values({ clerkId: id, name, email })
        .onConflictDoNothing(); // safe to re-run if webhook fires twice

      console.log(`Created user record for ${id}`);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Failed to create user record:", err);
      res.status(500).json({ error: "DB insert failed" });
    }
    return;
  }

  // ----- user.updated -----
  if (event.type === "user.updated") {
    const { id, first_name, last_name, email_addresses, primary_email_address_id } =
      (event as ClerkUserUpdatedEvent).data;

    const email = getPrimaryEmail(email_addresses, primary_email_address_id);
    const name  = getFullName(first_name, last_name);

    try {
      await db
        .update(users)
        .set({ name, email })
        .where(eq(users.clerkId, id));

      console.log(`Updated user record for ${id}`);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Failed to update user record:", err);
      res.status(500).json({ error: "DB update failed" });
    }
    return;
  }

  // ----- user.deleted -----
  if (event.type === "user.deleted") {
    const clerkUserId = (event as ClerkUserDeletedEvent).data.id;

    // Clerk occasionally fires user.deleted with no id (org-level deletions etc.)
    // Always 200 so Clerk doesn't retry indefinitely.
    if (!clerkUserId) {
      console.warn("user.deleted event received with no user id — ignoring");
      res.status(200).json({ received: true });
      return;
    }

    try {
      await db.transaction(async (tx) => {
        // Step 1: Delete this user's SUBMISSIONS to other people's polls.
        // These won't be caught by cascade when we delete their own polls,
        // because the poll owner is someone else.
        await tx
          .delete(responses)
          .where(eq(responses.respondentId, clerkUserId));

        // Step 2: Delete polls they CREATED.
        // Schema cascade handles: questions → options, responses on those polls → answers.
        await tx
          .delete(polls)
          .where(eq(polls.creatorId, clerkUserId));

        // Step 3: Delete the user row itself.
        await tx
          .delete(users)
          .where(eq(users.clerkId, clerkUserId));
      });

      console.log(`Purged all data for user ${clerkUserId}`);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Failed to purge user data:", err);
      res.status(500).json({ error: "DB transaction failed" });
    }
    return;
  }

  // ----- All other event types — acknowledge and ignore -----
  res.status(200).json({ received: true });
};