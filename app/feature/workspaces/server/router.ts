import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema, updateWorkSpaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGE_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberType } from "../../members/type";
import { generateInvitationCode } from "@/lib/utils";
import { getMember } from "../../members/utils";

import { z } from "zod";
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

    .post("/", zValidator("form", createWorkspaceSchema), sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const { name, workspaceUrl, range } = c.req.valid("form");

        try {
            const fullWorkspaceUrl = `${workspaceUrl}`;

            const existingWorkspaces = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [Query.equal("workspaceUrl", fullWorkspaceUrl)]
            );

            if (existingWorkspaces.total > 0) {
                return c.json({
                    error: "This workspace URL is already taken. Please choose a different URL."
                }, 400);
            }
            const workspace = await databases.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name: name,
                    workspaceUrl: fullWorkspaceUrl,
                    range: range,
                    userId: user.$id,
                    imageUrl: null,
                    inviteCode: generateInvitationCode(6)
                },
            );

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberType.ADMIN
                }
            );
            return c.json({
                data: workspace,
                message: "Workspace created successfully"
            });

        } catch (error: any) {
            let errorMessage = "Failed to create workspace";
            return c.json({
                error: errorMessage
            }, 500);
        }
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
        zValidator("json", z.object({ workspaceUrl: z.string() })),
        async (c) => {
            const { workspaceId } = c.req.param();
            const { workspaceUrl } = c.req.valid("json");
            const databases = c.get("databases");
            const user = c.get("user");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (member) {
                return c.json({ error: "Already a member" }, 400);
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );

            console.log(" Workspace data:", {
                dbWorkspaceUrl: workspace.workspaceUrl,
                receivedUrl: workspaceUrl,
                match: workspace.workspaceUrl === workspaceUrl
            });

            if (workspace.workspaceUrl !== workspaceUrl) {
                return c.json({ error: "Invalid workspace URL" }, 400);
            }

            const currentMembers = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", workspaceId)]
            );

            const getMaxUsersFromRange = (range: string): number => {
                switch (range) {
                    case "1-2": return 2;
                    case "11-50": return 50;
                    case "51-100": return 100;
                    case "100+": return 1000;
                    default: return 10;
                }
            };

            const maxUsers = getMaxUsersFromRange(workspace.range);
            const currentCount = currentMembers.total;

            console.log(` Workspace capacity: ${currentCount}/${maxUsers} (Range: ${workspace.range})`);

            if (currentCount >= maxUsers) {
                return c.json({
                    error: `Workspace is full! Maximum ${maxUsers} members allowed.`
                }, 400);
            }

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

            return c.json({
                data: workspace,
                message: `Successfully joined! (${currentCount + 1}/${maxUsers} members)`
            });
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
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const taskCount = thisMonthTasks.total;
            const taskDifference = taskCount - lastMonthTasks.total;


            const thisMonthCompletedTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
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
                    Query.equal("assigneeId", member.$id),
                    Query.equal("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const completedTaskCount = thisMonthCompletedTask.total;
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTask.total;


            const thisMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
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
                    Query.equal("assigneeId", member.$id),
                    Query.notEqual("status", TaskType.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const incompleteTasksCount = thisMonthIncompleteTasks.total;
            const incompleteTaskDifference = incompleteTasksCount - lastMonthIncompleteTasks.total;


            const thisMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
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
                    Query.equal("assigneeId", member.$id),
                    Query.notEqual("status", TaskType.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const overDueTaskCount = thisMonthOverdueTasks.total;
            const overDueTaskDifference = overDueTaskCount - lastMonthOverdueTasks.total;

            return c.json({
                data: {
                    taskCount,
                    taskDifference,
                    assignedTaskCount: taskCount,
                    assignedTaskDifference: taskDifference,
                    completedTaskCount,
                    completedTaskDifference,
                    incompleteTasksCount,
                    incompleteTaskDifference,
                    overDueTaskCount,
                    overDueTaskDifference,
                }
            });
        }
    );

export default app;