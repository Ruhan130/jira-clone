import { createAdminClient } from "@/lib/appwrite"
import { sessionMiddleware } from "@/lib/session-middleware"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { Hono } from "hono"
import { getMember } from "../utils"
import { DATABASE_ID, MEMBERS_ID, USERS_ID } from "@/config"
import { Query } from "node-appwrite"
import { Member, MemberType } from "../type"
const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            try {
                const { users } = await createAdminClient();
                const databases = c.get("databases");
                const { workspaceId } = c.req.valid("query");
                const user = c.get("user");

                const member = await getMember({
                    databases,
                    workspaceId,
                    userId: user.$id
                });

                if (!member) {
                    return c.json({ error: "Unauthorized" }, 401);
                }

                const members = await databases.listDocuments<Member>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.equal("workspaceId", workspaceId)]
                );

                const populatedMembers = await Promise.all(
                    members.documents.map(async (member) => {
                        try {
                            const authUser = await users.get(member.userId);
                            let profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name || authUser.email)}&background=random`;

                            try {
                                const userProfile = await databases.getDocument(
                                    DATABASE_ID,
                                    USERS_ID,
                                    member.userId
                                );
                                if (userProfile.profileImage) {
                                    profileImage = userProfile.profileImage;
                                }
                            } catch (error) {
                                console.log(" Profile not found, using default");
                            }

                            return {
                                ...member,
                                name: authUser.name || authUser.email,
                                email: authUser.email,
                                profileImage: profileImage
                            };

                        } catch (error) {
                            console.log(" User not found:", member.userId);
                            return {
                                ...member,
                                name: "Unknown User",
                                email: "unknown@example.com",
                                profileImage: `https://ui-avatars.com/api/?name=Unknown&background=gray`
                            };
                        }
                    })
                );

                return c.json({
                    data: {
                        ...members,
                        documents: populatedMembers,
                    }
                });

            } catch (error) {
                console.error(" Members API Error:", error);
                return c.json({
                    error: "Failed to fetch members",
                    details: error
                }, 500);
            }
        }
    )
    .delete(
        "/:memberId",
        sessionMiddleware,
        async (c) => {
            const { memberId } = c.req.param();
            const user = c.get("user");
            const databases = c.get("databases");

            const memberToDelte = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
            );

            const allMembersInfoWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", memberToDelte.workspaceId)]
            );

            const member = await getMember(
                {
                    databases,
                    workspaceId: memberToDelte.workspaceId,
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
                return c.json({ error: "Cannot delete the only member" }, 400);
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
                [Query.equal("workspaceId", memberToUpdate.workspaceId)]
            );

            const member = await getMember(
                {
                    databases,
                    workspaceId: memberToUpdate.workspaceId,
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
                return c.json({ error: "Can not downgrade the only member" }, 400);
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

    .get("/all", sessionMiddleware, async (c) => {
        try {
            const { users } = await createAdminClient();
            const databases = c.get("databases");

            console.log("👥 Fetching all members...");

            const members = await databases.listDocuments<Member>(
                DATABASE_ID,
                MEMBERS_ID
            );

            console.log("✅ Members fetched from database:", members.documents.length);

            // ✅ FIXED: Safe user fetching with error handling
            const populatedMembers = await Promise.all(
                members.documents.map(async (member, index) => {
                    try {
                        const user = await users.get(member.userId);
                        return {
                            ...member,
                            name: user.name || user.email,
                            email: user.email,
                            profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random`
                        };
                    } catch (userError) {
                        return {
                            ...member,
                            name: `User ${member.userId.substring(0, 8)}...`,
                            email: "unknown@email.com",
                            profileImage: `https://ui-avatars.com/api/?name=Unknown&background=random`,
                            isUserDeleted: true
                        };
                    }
                })
            );

            console.log("✅ All members processed:", populatedMembers.length);
            return c.json({
                data: {
                    ...members,
                    documents: populatedMembers,
                }
            });

        } catch (error) {
            console.error("❌ Members API Error:", error);
            // console.error("❌ Error stack:", error.stack);

            return c.json({
                error: error instanceof Error ? error.message : "Internal server error",
                // details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }, { status: 500 });
        }
    });
export default app

