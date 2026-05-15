import type { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";

export const syncUser = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) throw new ApiError(401, "Unauthorized");

    // fetch full user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId!);

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

    // upsert — insert if new, do nothing if already exists
    await db
        .insert(users)
        .values({ clerkId: userId!, name, email })
        .onConflictDoNothing(); // if clerkId already exists, skip

    res.status(200).json(new ApiResponse(200, { synced: true }, "User synced"));
};