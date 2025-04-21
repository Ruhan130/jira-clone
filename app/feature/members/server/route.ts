import { createAdminClient } from "@/lib/appwrite"
import { sessionMiddleware } from "@/lib/session-middleware"

import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

import { Hono } from "hono"
import { getMember } from "../utils"
import { DATABASE_ID, WORKSPACES_ID } from "@/config"
import { Query } from "node-appwrite"

const app = new Hono()
    .get("/",
        sessionMiddleware,
        zValidator("query",
            z.object({ workspaceId: z.string() })),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const { workspaceId } = c.req.valid("query");
            const user = c.get("user");

            const member = getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unothorized" }, 401);
            }

            const memebers = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [Query.equal("workspaceId", workspaceId)]
            );

            const popullatedMembers = await Promise.all(
                memebers.documents.map(async (member) => {
                    const user = await users.get(member.$id);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email
                    }
                })
            );

            return c.json(
                {
                    data: {
                        ...memebers,
                        documents: popullatedMembers,
                    }
                }
            )
        }
    )

export default app 