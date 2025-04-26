import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchenma } from "../schemas";
import { getMember } from "../../members/utils";
import { DATABASE_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";

const app = new Hono()
    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createTaskSchenma),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
                description
            } = c.req.valid("json");


            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const hightestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("status", status),
                    Query.equal("worksapceId", workspaceId),
                    Query.orderAsc("positon"),
                    Query.limit(1)
                ]
            );

            const newPosition =
                hightestPositionTask.documents.length > 0 ? hightestPositionTask.documents[0].position + 1000 : 1000;

            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId,
                    description,
                    position: newPosition
                }

            );

            return c.json({ data: task });


        }
    )

export default app