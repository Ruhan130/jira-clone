import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";
import { DATABASE_ID, IMAGE_BUCKET_ID, MEMBERS_ID, TEAMS_ID } from "@/config";
import { createTeamAPISchema } from "../schemas";
import { getMember } from "../../members/utils";



const app = new Hono()
    .post(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form", createTeamAPISchema),
        async (c) => {
            const user = c.get("user");
            const storage = c.get("storage");
            const databases = c.get("databases");
            const {
                name,
                image,
                members, 
                description,
                team_lead,
                
            } = c.req.valid("form");

            console.log("📝 Received Data:", {
                name,
                description,
                team_lead,
                members: members,
                image: typeof image
            });

            const workspaceId = c.req.param("workspaceId");

            let uploadedImageUrl: string | undefined;

           
            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGE_BUCKET_ID,
                    ID.unique(),
                    image,
                );
                const arrayBuffer = await storage.getFileView(
                    IMAGE_BUCKET_ID,
                    file.$id
                );
                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
            }

            
            console.log(" Storing members:", members);

            const team = await databases.createDocument(
                DATABASE_ID,
                TEAMS_ID,
                ID.unique(),
                {
                    name,
                    workspaceId,
                    image: uploadedImageUrl,
                    members: members,
                    description: description || "",
                    team_lead: team_lead,
                    createdBy: user.$id,
                }
            );

            return c.json({ data: team });
        }
    )
    .get(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const workspaceId = c.req.param("workspaceId");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

      
            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const teams = await databases.listDocuments( 
                DATABASE_ID,
                TEAMS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                ]
            );
            console.log("Teams Data:" , teams)
            return c.json({ data: teams });
        }
    )
export default app