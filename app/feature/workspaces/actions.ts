import { cookies } from "next/headers";
import { Account, Client, Databases, Query } from "node-appwrite"
import { AUTH_CONST } from "../auth/constant";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

export const getWorkspaces = async () => {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

        const sesion = await cookies().get(AUTH_CONST);


        if (!sesion) return { documents: [], total: 0 };

        client.setSession(sesion.value);


        const account = new Account(client);
        const databases = new Databases(client);
        const user = await account.get();

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)]
        );

        if (members.total === 0) {
            return { documents: [], total: 0 };
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

        return worksapces;
    } catch {
        return { documents: [], total: 0 };
    }
}