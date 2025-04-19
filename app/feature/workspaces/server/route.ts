import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWrokspaceSchemas, updateWorkSpaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGE_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberType } from "../../members/type";
import { generateInvitationCode } from "@/lib/utils";
import { getMember } from "../../members/utils";
import { error } from "console";


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
            } else {
                uploadedImageUrl = image;
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
    );

export default app;