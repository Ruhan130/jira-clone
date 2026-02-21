import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Hono } from "hono";
import { createCommentSchema, createSubTaskSchema, createTaskSchenma, reactionSchema, updateSubtaskSchema } from "../schemas";
import { getMember } from "../../members/utils";
import { COMMENT_ID, DATABASE_ID, MEMBERS_ID, PROJECTS_ID, SUBTASK_ID, TASKS_ID, USERS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { Task, TaskType } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "../../projects/types";



const app = new Hono()
    .delete(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { taskId } = c.req.param();


            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }


            await databases.deleteDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            return c.json({ data: { $id: task.$id } });
        }
    )
    .get(
        "/",
        sessionMiddleware,
        zValidator(
            "query",
            z.object({
                workspaceId: z.string(),
                projectId: z.string().nullish(),
                assigneeId: z.string().nullish(),
                status: z.nativeEnum(TaskType).nullish(),
                search: z.string().nullish(),
                dueDate: z.string().nullish(),
            })
        ),
        async (c) => {
            try {
                const { users } = await createAdminClient();
                const databases = c.get("databases");
                const user = c.get("user");

                const {
                    workspaceId,
                    projectId,
                    status,
                    search,
                    assigneeId,
                    dueDate
                } = c.req.valid("query");

                const member = await getMember({
                    databases,
                    workspaceId,
                    userId: user.$id
                });

                if (!member) {
                    return c.json({ error: "Unauthorized" }, 401);
                }

                const query = [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt"),
                ];

                if (projectId) {
                    query.push(Query.equal("projectId", projectId));
                }

                if (status) {
                    query.push(Query.equal("status", status));
                }

                if (assigneeId) {
                    query.push(Query.equal("assigneeId", assigneeId));
                }

                if (dueDate) {
                    query.push(Query.equal("dueDate", dueDate));
                }

                if (search) {
                    query.push(Query.equal("name", search));
                }

                const tasks = await databases.listDocuments<Task>(
                    DATABASE_ID,
                    TASKS_ID,
                    query
                );

                const projectIds = tasks.documents.map((task) => task.projectId);
                const assigneeIds = tasks.documents.map((task) => task.assigneeId);

                const projects = await databases.listDocuments<Project>(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
                );

                const members = await databases.listDocuments(
                    DATABASE_ID,
                    MEMBERS_ID,
                    assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
                );

                const assignees = await Promise.all(
                    members.documents.map(async (member) => {
                        try {
                            const user = await users.get(member.userId);
                            return {
                                ...member,
                                name: user.name || user.email,
                                email: user.email
                            };
                        } catch (error) {
                            console.log(" User not found:", member.userId);
                            return {
                                ...member,
                                name: "Unknown User",
                                email: "unknown@example.com"
                            };
                        }
                    }),
                );

                const populatedTasks = tasks.documents.map((task) => {
                    const project = projects.documents.find(
                        (project) => project.$id === task.projectId,
                    );

                    const assignee = assignees.find(
                        (assignee) => assignee.$id === task.assigneeId,
                    );

                    return {
                        ...task,
                        project,
                        assignee
                    };
                });

                return c.json({
                    data: {
                        ...tasks,
                        documents: populatedTasks,
                    }
                });

            } catch (error) {
                console.error(" Tasks API Error:", error);
                return c.json({
                    error: "Internal server error",
                    details: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error)
                }, 500);
            }
        }
    )

    .post("/",
        sessionMiddleware,
        zValidator("json", createTaskSchenma),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { users } = await createAdminClient();

            const {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
                priority
            } = c.req.valid("json");

            console.log({
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
                priority
            });

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            let assigneeDetails: {
                name: string | null,
                email: string | null,
                profileImage: string | null
            } = {
                name: null,
                email: null,
                profileImage: null
            };
            if (assigneeId) {
                try {
                    console.log("=== ASSIGNEE DETAILS FETCH ===");
                    console.log("Assignee ID (Member ID):", assigneeId);


                    const assigneeMember = await databases.getDocument(
                        DATABASE_ID,
                        MEMBERS_ID,
                        assigneeId
                    );
                    const authUser = await users.get(assigneeMember.userId);
                    console.log("Auth user:", { name: authUser.name, email: authUser.email });

                    let profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name || authUser.email)}&background=random`;
                    try {
                        const userProfile = await databases.getDocument(
                            DATABASE_ID,
                            USERS_ID,
                            assigneeMember.userId
                        );

                        console.log("User profile found:", userProfile);

                        if (userProfile.profileImage) {
                            profileImage = userProfile.profileImage;
                        }
                    } catch (profileError) {
                        console.log(" Profile fetch failed:", profileError);
                    }
                    assigneeDetails = {
                        name: authUser.name || authUser.email,
                        email: authUser.email,
                        profileImage: profileImage
                    };

                    console.log(" Final assignee details:", assigneeDetails);

                } catch (error) {
                    console.error(" Assignee details fetch failed:", error);
                }
            }

            const hightestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderAsc("position"),
                    Query.limit(1)
                ]
            );

            const newPosition =
                hightestPositionTask.documents.length > 0 ?
                    hightestPositionTask.documents[0].position + 1000 : 1000;

            // UPDATED: Task create with assignee details
            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name: name,
                    status: status,
                    workspaceId: workspaceId,
                    projectId: projectId,
                    dueDate: dueDate.toISOString(),
                    assigneeId: assigneeId,
                    position: newPosition,
                    priority: priority,
                    assigneeName: assigneeDetails.name,
                    assigneeEmail: assigneeDetails.email,
                    assigneeProfileImage: assigneeDetails.profileImage
                }
            );

            console.log(" Task created with assignee details:", task);
            return c.json({ data: task });
        }
    )
    .patch(
        "/:taskId",
        sessionMiddleware,
        zValidator("json", createTaskSchenma.partial()),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { users } = await createAdminClient();
            const { taskId } = c.req.param();

            const {
                name,
                status,
                description,
                projectId,
                dueDate,
                assigneeId,
                priority
            } = c.req.valid("json");

            console.log({
                name,
                status,
                priority,
                projectId,
                dueDate,
                assigneeId,
            });

            const existingTask = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
            );

            const member = await getMember({
                databases,
                workspaceId: existingTask.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }


            const updateData: any = {};

            if (name !== undefined) updateData.name = name;
            if (status !== undefined) updateData.status = status;
            if (projectId !== undefined) updateData.projectId = projectId;
            if (dueDate !== undefined) updateData.dueDate = dueDate;
            if (description !== undefined) updateData.description = description;
            if (priority !== undefined) updateData.priority = priority;
            if (assigneeId !== undefined) updateData.assigneeId = assigneeId;


            if (assigneeId && assigneeId !== existingTask.assigneeId) {
                console.log("🔄 Fetching new assignee details for:", assigneeId);

                try {
                    const assigneeMember = await databases.getDocument(
                        DATABASE_ID,
                        MEMBERS_ID,
                        assigneeId
                    );
                    const authUser = await users.get(assigneeMember.userId);

                    let profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name || authUser.email)}&background=random`;

                    try {
                        const userProfile = await databases.getDocument(
                            DATABASE_ID,
                            USERS_ID,
                            assigneeMember.userId
                        );
                        if (userProfile.profileImage) {
                            profileImage = userProfile.profileImage;
                        }
                    } catch (profileError) {
                        console.log(" Profile fetch failed:", profileError);
                    }

                    updateData.assigneeName = authUser.name || authUser.email;
                    updateData.assigneeEmail = authUser.email;
                    updateData.assigneeProfileImage = profileImage;

                    console.log(" New assignee details updated:", {
                        name: updateData.assigneeName,
                        email: updateData.assigneeEmail
                    });

                } catch (error) {
                    console.error(" Assignee fetch failed:", error);
                }
            }
            const task = await databases.updateDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                updateData
            );

            console.log(" Task updated successfully");
            return c.json({ data: task });
        }
    )
    .get(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const { taskId } = c.req.param();
            const currentUser = c.get("user");
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const currentMember = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: currentUser.$id,
            });

            if (!currentMember) {
                return c.json({ error: "Unauthorized" }, 401);
            };

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                task.projectId
            );

            const member = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                task.assigneeId
            );

            const user = await users.get(member.userId);

            const assignee = {
                ...member,
                name: user.name || user.email,
                email: user.email
            };

            return c.json({
                data: {
                    ...task,
                    project,
                    assignee,
                }
            });

        }
    )
    .post(
        "/bulk-update",
        sessionMiddleware,
        zValidator(
            "json",
            z.object({
                tasks: z.array(
                    z.object({
                        $id: z.string(),
                        status: z.nativeEnum(TaskType),
                        position: z.number().int().positive().min(1000).max(1_000_000),
                    })
                )
            })
        ),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { tasks } = await c.req.valid("json");

            const taskToUpdate = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [Query.contains("$id", tasks.map((task) => task.$id))]
            );

            const workspaceIds = new Set(taskToUpdate.documents.map(task => task.workspaceId));
            if (workspaceIds.size !== 1) {
                return c.json({ error: "All tasks must belong to the same workspace" });
            }

            const workspaceId = workspaceIds.values().next().value;

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorzied" }, 401);
            }
          
            for (const taskUpdate of tasks) {
                if (taskUpdate.status === TaskType.DONE) {
                    const subtasks = await databases.listDocuments(
                        DATABASE_ID,
                        SUBTASK_ID, 
                        [Query.equal("parentTaskId", taskUpdate.$id)]
                    );
                    const incompleteSubtasks = subtasks.documents.filter(
                        subtask => subtask.status !== "DONE"
                    );

                    if (incompleteSubtasks.length > 0) {
                        const taskDoc = taskToUpdate.documents.find(t => t.$id === taskUpdate.$id);
                        const taskName = taskDoc?.name || "Task";

                        return c.json({
                            error: `Cannot complete "${taskName}". ${incompleteSubtasks.length} subtasks are incomplete.`,
                            taskId: taskUpdate.$id,
                            incompleteCount: incompleteSubtasks.length,
                            incompleteSubtasks: incompleteSubtasks.map(s => s.name || s.$id)
                        }, 400);
                    }
                }
            }

            const updatedTask = await Promise.all(
                tasks.map(async (task) => {
                    const { $id, position, status } = task;
                    return databases.updateDocument<Task>(
                        DATABASE_ID,
                        TASKS_ID,
                        $id,
                        { status, position }
                    );
                })
            );

            return c.json({ data: updatedTask });
        }
    )

    .post(
        "/:workspaceId/:taskId/subtask",
        sessionMiddleware,
        zValidator("json", createSubTaskSchema),
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                const taskId = c.req.param("taskId");
                const workspaceId = c.req.param("workspaceId");
                const {
                    assigneeId,
                    name,
                    priority,
                    projectId,
                    status,
                    description,
                    position,
                    dueDate,
                    label
                } = c.req.valid("json");

                const member = await getMember({
                    databases,
                    workspaceId,
                    userId: user.$id
                });

                if (!member) {
                    return c.json({ error: "Unauthorized" }, 400)
                }

                const subtask = await databases.createDocument(
                    DATABASE_ID,
                    SUBTASK_ID,
                    ID.unique(),
                    {
                        workspaceId: workspaceId,
                        assigneeId: assigneeId,
                        name: name,
                        parentTaskId: taskId,
                        priority: priority,
                        projectId: projectId,
                        status: "TODO",
                        description: description,
                        position: position || 0,
                        dueDate: dueDate,
                        label: label,
                    }
                );

                return c.json({
                    data: subtask
                });
            } catch (e) {
                console.error("Sub task not created", e);
                return c.json({ error: "Failed to create subtask" }, 500);
            }
        }
    )
    .get(
        "/:workspaceId/:taskId/subtasks",
        sessionMiddleware,
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                const workspaceId = c.req.param("workspaceId");
                const taskId = c.req.param("taskId");

                const member = await getMember({
                    databases,
                    workspaceId,
                    userId: user.$id
                });

                if (!member) {
                    return c.json({ error: "Unauthorized" }, 400);
                }

                const subtask = await databases.listDocuments(
                    DATABASE_ID,
                    SUBTASK_ID,
                    [
                        Query.equal("parentTaskId", taskId),
                        Query.equal("workspaceId", workspaceId),
                        Query.orderAsc("position")
                    ]
                )
                console.log("SUBTASK", subtask)
                return c.json({
                    data: subtask.documents,
                    total: subtask.total
                })
            } catch (e) {
                console.error("Failed to fetch subtasks", e);
                return c.json({ error: "Failed to fetch subtasks" }, 500);
            }
        }
    )
    .patch(
        "/:workspaceId/:taskId/subtasks/:subtaskId",
        sessionMiddleware,
        zValidator("json", updateSubtaskSchema),
        async (c) => {
            try {
                const user = c.get("user")
                const databases = c.get("databases")
                const taskId = c.req.param("taskId");
                const subtaskId = c.req.param("subtaskId");
                const { status, priority, name, dueDate, description, attachments } = c.req.valid("json");
                const workspaceId = c.req.param("workspaceId");

                const member = await getMember({
                    databases,
                    workspaceId,
                    userId: user.$id
                });

                if (!member) {
                    return c.json({ error: "Unauthorized" }, 400)
                }
                const updateTask = await databases.updateDocument(
                    DATABASE_ID,
                    SUBTASK_ID,
                    subtaskId,
                    { status, priority, name, dueDate, description, attachments: JSON.stringify(attachments) }
                )
                return c.json({ data: updateTask });

            } catch (e) {
                return c.json({ error: "Failed to update subtask" }, 500);
            }
        }
    )


    // --------------------- COMMENT APISS --------------------

    .get(
        "/:subtaskId/comments",
        sessionMiddleware,
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                const subtaskId = c.req.param("subtaskId")

                console.log("SUBTASK ID ", subtaskId)

                const subtask = await databases.getDocument(
                    DATABASE_ID,
                    SUBTASK_ID,
                    subtaskId
                );

                const member = await getMember({
                    databases,
                    workspaceId: subtask.workspaceId,
                    userId: user.$id
                });

                if (!member) {
                    return c.json({ error: "unauthorized" }, 400);
                }

                const comments = await databases.listDocuments(
                    DATABASE_ID,
                    COMMENT_ID,
                    [
                        Query.equal("subtaskId", subtaskId),
                        Query.orderAsc("$createdAt"),
                    ]

                );


                return c.json({
                    data: comments.documents
                })
            } catch (e) {
                console.error("Failed to fetch comments", e);
                return c.json({ error: "Failed to fetch comments" }, 500);
            }
        }
    )

    .post(
        "/:subtaskId/create-comment",
        sessionMiddleware,
        zValidator("json", createCommentSchema),
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                const subtaskId = c.req.param("subtaskId")
                const { content, parentCommentId, attachments } = c.req.valid("json");
                const subTask = await databases.getDocument(
                    DATABASE_ID,
                    SUBTASK_ID,
                    subtaskId
                );

                const useravatar = await databases.getDocument(
                    DATABASE_ID,
                    USERS_ID,
                    user.$id
                )

                const member = await getMember({
                    databases,
                    workspaceId: subTask.workspaceId,
                    userId: user.$id
                });

                if (!member) {
                    return c.json({ error: "Unauthorized" }, 400);
                }

                const comment = await databases.createDocument(
                    DATABASE_ID,
                    COMMENT_ID,
                    ID.unique(),
                    {
                        subtaskId: subtaskId,
                        workspaceId: subTask.workspaceId,
                        userId: user.$id,
                        userName: user.name,
                        userEmail: user.email,
                        userAvatar: useravatar.profileImage || "",
                        content: content,
                        parentCommentId: parentCommentId || null,
                        attachments: attachments || null,
                    }
                );

                return c.json({
                    data: comment
                });
            } catch (e) {
                console.log("Failed to create comment ", e)
                return c.json({ error: "Failed to Create Comment " }, 500);
            }

        }
    )

    .delete(
        "/:commentId/delete-comments",
        sessionMiddleware,
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user")
                const commentId = c.req.param("commentId");
                const comments = await databases.getDocument(
                    DATABASE_ID,
                    COMMENT_ID,
                    commentId,
                )

                const member = await getMember({
                    databases: databases,
                    workspaceId: comments.workspaceId,
                    userId: user.$id
                });

                if (!member) {
                    return c.json({ error: "Unauhtorized" }, 400);
                }
                if (comments.userId !== user.$id) {
                    return c.json({ error: "You can only delete your own comments" }, 403);
                }

                const deletedDocument = await databases.deleteDocument(
                    DATABASE_ID,
                    COMMENT_ID,
                    commentId
                );

                return c.json({
                    data: {
                        id: commentId,
                        message: "Comment deleted successfully"
                    }
                });
            } catch (e) {
                console.log("Delete Api Error", 500);
                return c.json({ error: "Failed to delete comments" }, 500);
            }
        }
    )

    .patch(
        "/comments/:commentId/reactions",
        sessionMiddleware,
        zValidator("json", reactionSchema),
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                const commentId = c.req.param("commentId");
                const { emoji, action } = c.req.valid("json");

                console.log("COMMENT ID", commentId);

                const comment = await databases.getDocument(
                    DATABASE_ID,
                    COMMENT_ID,
                    commentId
                );

                const member = await getMember({
                    databases,
                    workspaceId: comment.workspaceId,
                    userId: user.$id
                });

                console.log("WORKSPACE ID", comment.workspaceId);

                if (!member) {
                    return c.json({ error: "Unauthorized" }, 400);
                }


                let reactions = [];
                try {
                    reactions = comment.reactions ? JSON.parse(comment.reactions) : [];
                } catch (e) {
                    console.error("Error parsing reactions:", e);
                    reactions = [];
                }

                if (action === "add") {
                    const existingIndex = reactions.findIndex(
                        (r: { userId: string; emoji: string; }) => r.userId === user.$id && r.emoji === emoji
                    );

                    if (existingIndex === -1) {
                        reactions.push({
                            emoji,
                            userId: user.$id,
                            userName: user.name,
                            createdAt: new Date().toISOString()
                        });
                    }
                } else if (action === "remove") {
                    reactions = reactions.filter(
                        (r: { userId: string; emoji: string; }) => !(r.userId === user.$id && r.emoji === emoji)
                    );
                }


                const updatedComment = await databases.updateDocument(
                    DATABASE_ID,
                    COMMENT_ID,
                    commentId,
                    {
                        reaction: JSON.stringify(reactions)
                    }
                );

                return c.json({
                    data: {
                        commentId,
                        reactions,
                        updatedAt: new Date().toISOString()
                    }
                });

            } catch (error) {
                console.error("Comment reaction error:", error);

                // Better error handling
                if (typeof error === "object" && error !== null && "code" in error && (error as any).code === 404) {
                    return c.json({ error: "Comment not found" }, 404);
                }

                return c.json({
                    error: "Failed to change reaction",
                    details: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error)
                }, 500);
            }
        }
    )

export default app