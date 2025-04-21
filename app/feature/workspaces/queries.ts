import { Account, Client, Databases, Query } from "node-appwrite"
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";
import { Workspace } from "./type";
import { createSessionClient } from "@/lib/appwrite";

export const getWorkspaces = async () => {
    try {
        const { databases, account } = await createSessionClient();
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

interface GetWorkspaceProps {
    workspaceId : string 
};







interface GetWorkspaceInfo {
    workspaceId: string
}
export const getWorkspaceInfo = async ({ workspaceId }: GetWorkspaceInfo) => {
    try {
        const { databases } = await createSessionClient();
        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );
        return {
            name: workspace.name
        };
    } catch {
        return null;
    }
}




