import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWrokspaceSchemas, updateWorkSpaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGE_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberType } from "../../members/type";
import { generateInvitationCode } from "@/lib/utils";
import { getMember } from "../../members/utils";
import { error } from "console";
import { string, z } from "zod";
import { Workspace } from "../type";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskType } from "../../tasks/types";


const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)]
        );

        if (members.total === 0) {
            return c.json({ data: { documents: [], total: 0 } });
        }

        const workspaceIds = members.documents.map((memeber) => memeber.workspaceId);


        const worksapces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds)
            ]
        );
        return c.json({ data: worksapces });
    })
    .get(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { workspaceId } = c.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );

            return c.json({ data: workspace })

        }
    )
    .get(
        "/:workspaceId/info",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const { workspaceId } = c.req.param();


            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );

            return c.json({
                data: {
                    id: workspace.$id,
                    name: workspace.name,
                    imageUrl: workspace.imageUrl
                }
            })

        }
    )
    .post("/", zValidator("form", createWrokspaceSchemas), sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");

        const { name, image } = c.req.valid("form");

        let uploadedImageUrl: string | undefined;

        if (image instanceof File) {
            const file = await storage.createFile(
                IMAGE_BUCKET_ID,
                ID.unique(),
                image,

            );
            const arryBuffer = await storage.getFileView(
                IMAGE_BUCKET_ID,
                file.$id
            );
            uploadedImageUrl = `data:image/png;base64,${Buffer.from(arryBuffer).toString("base64")}`;
        }



        const workspaces = await databases.createDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            ID.unique(),
            {
                // KEY POINT EXACT SAME NAAM HOGA JO APPWRITE K ATTRIBUTES M HAIN
                name,
                userId: user.$id,
                imageUrl: uploadedImageUrl,
                inviteCode: generateInvitationCode(6)
            },
        );

        await databases.createDocument(
            DATABASE_ID,
            MEMBERS_ID,
            ID.unique(),
            {
                userId: user.$id,
                workspaceId: workspaces.$id,
                role: MemberType.ADMIN
            }
        )

        return c.json({ data: workspaces });
    })
    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form", updateWorkSpaceSchema),
        async (c) => {

            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { workspaceId } = c.req.param();

            const { name, image } = c.req.valid("form");

            const memeber = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!memeber || memeber.role !== MemberType.ADMIN) {
                return c.json({ error: "Unuthoirzed" }, 401);
            }

            let uploadedImageUrl: string | null = null;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGE_BUCKET_ID,
                    ID.unique(),
                    image,
                );
                const arryBuffer = await storage.getFileView(
                    IMAGE_BUCKET_ID,
                    file.$id
                );
                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arryBuffer).toString("base64")}`;
            } else if (typeof image === "string" && image.trim() !== "") {
                // Keep existing image
                uploadedImageUrl = image;
            } else if (image === null || image === undefined || image === "") {
                // 👇 Explicitly remove the image
                uploadedImageUrl = null;
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadedImageUrl
                }
            );
            return c.json({ data: workspace })
        }
    )
    .delete("/:workspaceId", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const { workspaceId } = c.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        });

        if (!member || member.role !== MemberType.ADMIN) {
            return c.json({ error: "Unotorized" }, 401);
        }

        await databases.deleteDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );
        return c.json({ data: { $id: workspaceId } });
    }
    )
    .post("/:workspaceId/rest-invite-code", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const { workspaceId } = c.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        });

        if (!member || member.role !== MemberType.ADMIN) {
            return c.json({ error: "Unotorized" }, 401);
        }

        const workspace = await databases.updateDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
            {
                inviteCode: generateInvitationCode(6),
            }
        );
        return c.json({ data: { $id: workspace } });
    }
    )
    .post(
        "/:workspaceId/join",
        sessionMiddleware,
        zValidator("json", z.object({ code: z.string() })),
        async (c) => {
            const { workspaceId } = c.req.param();
            const { code } = c.req.valid("json");

            const databases = c.get("databases");
            const user = c.get("user");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (member) {
                return c.json({ error: "Already a member" }, 400);
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );

            if (workspace.inviteCode !== code) {
                return c.json({ error: "Invalid invite code" }, 400);
            };

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberType.MEMBER
                }
            );

            return c.json({ data: workspace });
        }
    )
    .get(
        "/:workspaceId/analytics",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const { workspaceId } = c.req.param();



            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized " }, 401);
            }


            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(subMonths(now, 1));


            const thisMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const taskCount = thisMonthTasks.total;
            const taskDifference = taskCount - lastMonthTasks.total;

            const thisMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]);


            const lastMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]);


            const assignedTaskCount = thisMonthAssignedTasks.total;
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;

            const thisMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const incompleteTasksCount = thisMonthIncompleteTasks.total;
            const incompleteTaskDifference = incompleteTasksCount - lastMonthIncompleteTasks.total;

            const thisMonthCompletedtask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthCompletedTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const completedTaskCount = thisMonthCompletedtask.total;
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTask.total;

            const thisMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskType.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskType.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const overDueTaskCount = thisMonthOverdueTasks.total;
            const overDueTaskDifference = overDueTaskCount - lastMonthOverdueTasks.total;


            return c.json(
                {
                    data: {
                        taskCount,
                        taskDifference,
                        assignedTaskCount,
                        assignedTaskDifference,
                        completedTaskCount,
                        completedTaskDifference,
                        incompleteTasksCount,
                        incompleteTaskDifference,
                        overDueTaskCount,
                        overDueTaskDifference,
                    }
                }
            )

        }
    );

export default app;