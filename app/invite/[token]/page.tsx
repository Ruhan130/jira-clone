import { redirect } from "next/navigation";
import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, INVITATION_ID } from "@/config";


interface InvitePageProps {
    params: {
        token: string;
    };
}

const validateInviteToken = async (token: string) => {
    try {
        const { databases } = await createAdminClient();


        const invitations = await databases.listDocuments(
            DATABASE_ID,
            INVITATION_ID,
            [Query.equal("token", token)]
        );

        if (invitations.documents.length === 0) {
            return { valid: false, error: "Invalid invitation link" };
        }

        const invitation = invitations.documents[0];

        if (invitation.status === "accepted") {
            return { valid: false, error: "This invitation has already been used" };
        }
        if (new Date(invitation.expiresAt) < new Date()) {
            return { valid: false, error: "This invitation has expired" };
        }

        return {
            valid: true,
            invitation: {
                email: invitation.email,
                workspaceName: invitation.workspaceName,
                role: invitation.role,
                workspaceId: invitation.workspaceId
            }
        };

    } catch (error) {
        console.error("Token validation error:", error);
        return { valid: false, error: "Failed to validate invitation" };
    }
};

const InvitePage = async ({ params }: InvitePageProps) => {
    const { token } = params;

    console.log("🔍 Validating invite token:", token);

    const validation = await validateInviteToken(token);

    if (!validation.valid) {
        // Redirect to error page with error message
        redirect(`/invite-error?message=${encodeURIComponent(validation.error ?? "Unknown error")}`);
    }

    // Redirect to signup with invite context
    redirect(`/sign-in?invite=${token}`);
};

export default InvitePage;