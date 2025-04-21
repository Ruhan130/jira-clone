import { createAdminClient } from "@/lib/appwrite"
import { sessionMiddleware } from "@/lib/session-middleware"

import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

import { Hono } from "hono"
import { getMember } from "../utils"
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config"
import { Query } from "node-appwrite"
import { json } from "stream/consumers"
import { MemberType } from "../type"

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
    .delete(
        "/:memberId",
        sessionMiddleware,
        async (c) => {
            const memberId = c.req.param("memberId");
            const databases = c.get("databases");
            const user = c.get("user");

            const memberToDelte = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
            );

            const allMembersInfoWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", memberToDelte.$id)]
            );

            const member = await getMember(
                {
                    databases,
                    workspaceId: memberToDelte.$id,
                    userId: user.$id
                }
            );

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }
            if (member.$id !== memberToDelte.$id && member.role !== MemberType.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            if (allMembersInfoWorkspace.total === 1) {
                return c.json({ error: "Unauthorized" }, 400);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId
            );

            return c.json({ data: { $id: memberToDelte.$id } });
        }
    )
    .patch(
        "/:memberId",
        sessionMiddleware,
        zValidator(
            "json",
            z.object({ role: z.nativeEnum(MemberType) })
        ),
        async (c) => {
            const memberId = c.req.param("memberId");
            const databases = c.get("databases");
            const { role } = c.req.valid("json");
            const user = c.get("user");

            const memberToUpdate = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
            );

            const allMembersInfoWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", memberToUpdate.$id)]
            );

            const member = await getMember(
                {
                    databases,
                    workspaceId: memberToUpdate.$id,
                    userId: user.$id
                }
            );

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }
            if (member.role !== MemberType.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            if (allMembersInfoWorkspace.total === 1) {
                return c.json({ error: "Unauthorized" }, 400);
            }

            await databases.updateDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
                {
                    role
                }
            );

            return c.json({ data: { $id: memberToUpdate.$id } });
        }
    )

export default app 