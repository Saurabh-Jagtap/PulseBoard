import type { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";

export const syncUser = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) throw new ApiError(401, "Unauthorized");

    const clerkUser = await clerkClient.users.getUser(userId);

    // Always use the primary email address, fall back to first available
    const primaryEmailId = clerkUser.primaryEmailAddressId;
    const email =
        clerkUser.emailAddresses.find((e) => e.id === primaryEmailId)
            ?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        "";

    // Safely extract the email prefix and provide an absolute string fallback
    const emailPrefix = email.split("@")[0] ?? "user";

    // Now name is guaranteed to be a strict 'string' type
    const name: string =
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        emailPrefix;

    // True upsert: insert if new, update name+email if already exists.
    await db
        .insert(users)
        .values({
            clerkId: userId,
            name: name,
            email: email
        })
        .onConflictDoUpdate({
            target: users.email,
            set: {
                clerkId: userId,
                name: name,
            },
        });

    res.status(200).json(new ApiResponse(200, { synced: true }, "User synced"));
};
