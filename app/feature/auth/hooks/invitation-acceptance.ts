import { DATABASE_ID, INVITATION_ID, MEMBERS_ID } from "@/config";
import { createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";

export const processInviteAcceptance = async (userId: string, token: string) => {
    const { databases } = await createAdminClient();
    
    // Get invitation details
    const invitations = await databases.listDocuments(
        DATABASE_ID,
        INVITATION_ID,
        [Query.equal("token", token)]
    );
    
    if (invitations.documents.length === 0) {
        throw new Error("Invalid invitation token");
    }
    
    const invitation = invitations.documents[0];
    
    // Check if already used or expired
    if (invitation.status === "accepted") {
        throw new Error("Invitation already used");
    }
    
    if (new Date(invitation.expiresAt) < new Date()) {
        throw new Error("Invitation expired");
    }
    
    // Add user to workspace
    await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
            userId: userId,
            workspaceId: invitation.workspaceId,
            role: invitation.role
        }
    );
    
    // Mark invitation as accepted
    await databases.updateDocument(
        DATABASE_ID,
        INVITATION_ID,
        invitation.$id,
        {
            status: "verified",
            usedAt: new Date().toISOString()
        }
    );
    
    return {
        workspaceId: invitation.workspaceId,
        workspaceName: invitation.workspaceName
    };
};