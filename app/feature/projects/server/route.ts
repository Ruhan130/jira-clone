import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from "../../members/utils";
import { DATABASE_ID, IMAGE_BUCKET_ID, PROJECTS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { createProjectSchema } from "../schema";
import { useGetMember } from "../../members/api/use-get-members";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.valid("query");

            if (!workspaceId) {
                return c.json({ error: "Missing workspaceId" }, 400);
            }


            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 400);
            }

            const projects = await databases.listDocuments(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ]
            );
            return c.json({ data: projects });
        }


    )
    .post(
        "/",
        sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { name, image, workspaceId } = c.req.valid("form");

            const member = await getMember(
                {
                    databases,
                    workspaceId,
                    userId: user.$id
                }
            );

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

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



            const project = await databases.createDocument(
                DATABASE_ID,
                PROJECTS_ID,
                ID.unique(),
                {
                    // KEY POINT EXACT SAME NAAM HOGA JO APPWRITE K ATTRIBUTES M HAIN
                    name,
                    userId: user.$id,
                    imageUrl: uploadedImageUrl,
                    workspaceId
                },
            );



            return c.json({ data: project });
        }
    )

export default app 