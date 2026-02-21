import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateSprintSchema, EditSprintSchema, } from "../schemas";
import { getMember } from "../../members/utils";
import { DATABASE_ID, SPRINT_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { zodResolver } from "@hookform/resolvers/zod";
import { Task, TaskType } from "../../tasks/types";
import { Sprint } from "../type";
import { z } from "zod";
import { json } from "stream/consumers";


const app = new Hono()
    .post(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("json", CreateSprintSchema),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const {
                name,
                tasks,
                startDate,
                endDate,
                goal,
                duration,
                sprintIdentifier
            } = c.req.valid("json");

            const workspaceId = c.req.param("workspaceId");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized " }, 401);
            }

            // Create Sprint
            const createSprint = await databases.createDocument(
                DATABASE_ID,
                SPRINT_ID,
                ID.unique(),
                {
                    name: name,
                    workspaceId,
                    duration: duration,
                    startDate: startDate,
                    endDate: endDate,
                    goal: goal,
                    tasks: tasks,
                    status: "draft",
                    sprintIdentifier: sprintIdentifier,
                }
            );

            const tasksArray = JSON.parse(tasks);
            for (const task of tasksArray) {
                if (task && task.id) {
                    console.log(`Updating task: ${task.id}`);
                    await databases.updateDocument(
                        DATABASE_ID,
                        TASKS_ID,
                        task.id,
                        {
                            sprintId: createSprint.$id
                        }
                    );
                } else {
                    console.error("Invalid task:", task);
                }
            }

            return c.json({
                data: createSprint
            });
        }
    )
    .post(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("json", CreateSprintSchema),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const {
                name,
                tasks,
                startDate,
                endDate,
                // reviewerId,
                goal,
                duration,
                sprintIdentifier
            } = c.req.valid("json");


            const workspaceId = c.req.param("workspaceId");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });


            if (!member) {
                return c.json({ error: "Unauthorized " }, 401);
            }

            const createSprint = await databases.createDocument(
                DATABASE_ID,
                SPRINT_ID,
                ID.unique(),
                {
                    name: name,
                    workspaceId,
                    duration: duration,
                    startDate: startDate,
                    endDate: endDate,
                    // reviewerId: reviewerId,
                    goal: goal,
                    tasks: tasks,
                    status: "draft",
                    sprintIdentifier: sprintIdentifier,

                }
            )
            return c.json({
                data: createSprint
            });
        }
    )
    .get(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const workspaceId = c.req.param("workspaceId");
            const user = c.get("user");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 400);
            }

            const sprint = await databases.listDocuments(
                DATABASE_ID,
                SPRINT_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                ]
            );

            console.log("Sprint DATA", sprint);
            return c.json({ data: sprint });
        }
    )
    .get("/:workspaceId/sprint/:sprintId", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const workspaceId = c.req.param("workspaceId");
        const sprintId = c.req.param("sprintId");
        const user = c.get("user");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 400);
        }

        const sprint = await databases.getDocument<Sprint>(
            DATABASE_ID,
            SPRINT_ID,
            sprintId
        );

        if (sprint.workspaceId !== workspaceId) {
            return c.json({ error: "Invalid Workspace" }, 403);
        }

        return c.json({ data: sprint });
    }
    )

    .patch(
        "/:workspaceId/edit-sprint/:sprintId",
        sessionMiddleware,
        zValidator("json", EditSprintSchema),
        async (c) => {
            const {
                name,
                tasks,
                startDate,
                endDate,
                // reviewerId,
                goal,
                duration
            } = c.req.valid("json");


            const databases = c.get("databases");
            const user = c.get("user");
            const sprintId = c.req.param("sprintId");
            const workspaceId = c.req.param("workspaceId")

            const exsistingMember = await databases.getDocument<Task>(
                DATABASE_ID,
                SPRINT_ID,
                sprintId,
            )

            const member = await getMember({
                databases,
                workspaceId: exsistingMember.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 400)
            }


            const sprint = await databases.updateDocument(
                DATABASE_ID,
                SPRINT_ID,
                sprintId,
                {
                    name: name,
                    workspaceId,
                    duration: duration,
                    startDate: startDate,
                    endDate: endDate,
                    // reviewerId: reviewerId,
                    goal: goal,
                    tasks: tasks,
                    status: "draft"
                }
            )
            console.log("Sprint DATA", sprint);
            return c.json({ data: sprint });

        }
    )

    .delete(
        "/:workspaceId/delete-sprint/:sprintId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const workspaceId = c.req.param("workspaceId");
            const sprintId = c.req.param("sprintId");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 400);
            }

            const sprint = await databases.getDocument(
                DATABASE_ID,
                SPRINT_ID,
                sprintId
            );

            const arrayOfTask = JSON.parse(sprint.tasks);
            for (const task of arrayOfTask) {
                if (task && task.id) {
                    await databases.updateDocument(
                        DATABASE_ID,
                        TASKS_ID,
                        task.id,
                        {
                            sprintId: null
                        }
                    );
                }
            }
            const deleteSprint = await databases.deleteDocument(
                DATABASE_ID,
                SPRINT_ID,
                sprintId
            );

            return c.json({ data: deleteSprint });
        }
    )
    .post(
        "/:workspaceId/sprint/:sprintId",
        sessionMiddleware,
        zValidator(
            "json",
            z.object({
                task: z.object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable(),
                    projectId: z.string(),
                    assigneeId: z.string(),
                    status: z.nativeEnum(TaskType),
                })
            }),
        ),
        async (c) => {
            const workspaceId = c.req.param("workspaceId");
            const databases = c.get("databases");
            const user = c.get("user");
            const sprintId = c.req.param("sprintId");

            const { task } = c.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId: workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const sprint = await databases.getDocument(
                DATABASE_ID,
                SPRINT_ID,
                sprintId
            );

            if (task && task.id) {
                await databases.updateDocument(
                    DATABASE_ID,
                    TASKS_ID,
                    task.id,
                    {
                        sprintId: sprint.$id
                    }
                );
            } else {
                console.error("Invalid task:", task);
            }
            const currentTasks = JSON.parse(sprint.tasks || "[]");
            currentTasks.push(task);

            const updatedSprint = await databases.updateDocument(
                DATABASE_ID,
                SPRINT_ID,
                sprintId,
                { tasks: JSON.stringify(currentTasks) }
            );

            return c.json({ data: updatedSprint });
        }
    )
    .post(
        "/:workspaceId/active-sprint/:sprintId",
        sessionMiddleware,
        async (c) => {
            const workspaceId = c.req.param("workspaceId");
            const sprintId = c.req.param("sprintId");
            const databases = c.get("databases");
            const user = c.get("user");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const sprint = await databases.getDocument(
                DATABASE_ID,
                SPRINT_ID,
                sprintId
            );

            const parsedTasks: Task[] = JSON.parse(sprint.tasks || "[]");

            const updatedTasks: Task[] = [];

            for (const task of parsedTasks) {

                if (task.status === "BACKLOG") {
                    await databases.updateDocument(
                        DATABASE_ID,
                        TASKS_ID,
                        task.id,
                        {
                            status: "TODO"
                        }
                    );

                    updatedTasks.push({ ...task, status: TaskType.IN_PROGRESS });
                } else {
                    updatedTasks.push(task);
                }
            }

            const updatedSprint = await databases.updateDocument(
                DATABASE_ID,
                SPRINT_ID,
                sprintId,
                {
                    tasks: JSON.stringify(updatedTasks),
                    isSprintActive: true,
                    status: "start"
                }
            );

            return c.json({ data: updatedSprint });
        }
    );



export default app;