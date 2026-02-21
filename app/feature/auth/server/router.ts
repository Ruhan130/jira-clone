
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { forgotPasswordSchema, inviteCoworkersSchema, loginSchema, registerSchema, resetPasswordSchema, sendMagicLinkSchema } from "../schemas";
import { createAdminClient, createSessionClientFromSecret } from "@/lib/appwrite";
import { Account, Client, ID, Permission, Query, Role, Storage } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie";
import { AUTH_CONST } from "../constant";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGE_BUCKET_ID, INVITATION_ID, USERS_ID, WORKSPACES_ID } from "@/config";

import { z } from "zod";
import { TokenService } from "@/lib/token-service";
import { sendVerificationCode } from "@/lib/email-service";
import { getMember } from "../../members/utils";
import { UseCreateProjectModal } from "../../projects/hooks/use-create-project-modal";
import { generateUniqueToken } from "../hooks/generate-token";
import { sendInviteEmail } from "../hooks/send-invite";
import { processInviteAcceptance } from "../hooks/invitation-acceptance";



const app = new Hono()
    .get("/current", sessionMiddleware, async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");

        console.log("=== CURRENT USER API DEBUG ===");
        console.log("Auth User ID:", user.$id);
        console.log("Auth User Email:", user.email);

        // Users collection se profile fetch karo
        let profileImage = null;

        try {
            console.log("Fetching from database...");
            console.log("Database ID:", DATABASE_ID);
            console.log("Users Collection ID:", USERS_ID);

            const userProfile = await databases.getDocument(
                DATABASE_ID,
                USERS_ID,
                user.$id
            );

            console.log("✅ User profile found:", userProfile);
            profileImage = userProfile.profileImage;
            console.log("✅ Profile image URL:", profileImage);

        } catch (error) {
            console.log("❌ Profile fetch failed:");
            console.log("Error message:", error);
        }

        const responseData = {
            ...user,
            profileImage: profileImage
        };

        console.log("=== FINAL RESPONSE ===");
        console.log("Response data:", responseData);

        return c.json({
            data: responseData
        });
    })

    .post("/check-user", zValidator("json", z.object({ email: z.string().email() })), async (c) => {
        const { email } = c.req.valid("json");

        try {
            const { databases } = await createAdminClient();
            const userList = await databases.listDocuments(
                DATABASE_ID,
                USERS_ID,
                [Query.equal("email", email)]
            );

            if (userList.total === 0) {
                return c.json({
                    exists: false,
                    isNewUser: true
                });
            }

            const user = userList.documents[0];

            return c.json({
                exists: true,
                isNewUser: false,
                provider: user.provider || "email"
            });

        } catch (error) {
            console.error("Check user error:", error);
            return c.json({ error: "Failed to check user" }, 500);
        }
    })

    .post("/login",
        zValidator("json", loginSchema),
        async (c) => {
            const { email, password } = c.req.valid("json");
            const inviteToken = c.req.query("inviteToken");

            const { account } = await createAdminClient();
            const session = await account.createEmailPasswordSession(
                email,
                password
            );

            setCookie(c, AUTH_CONST, session.secret, {
                path: '/',
                httpOnly: true,
                secure: false,
                sameSite: "Lax",
                maxAge: 60 * 60 * 24 * 30
            });

            if (inviteToken) {
                try {
                    const inviteResult = await processInviteAcceptance(session.userId, inviteToken);
                    console.log("User auto-joined workspace via invite");
                    return c.json({
                        success: true,
                        redirectTo: "workspace",
                        workspaceId: inviteResult.workspaceId
                    });
                } catch (inviteError) {
                    console.error("Invite processing failed:", inviteError);
                }
            }
            return c.json({ success: true });
        }
    )

    .post("/logout", sessionMiddleware, async (c) => {
        try {
            const account = c.get("account");

            await account.deleteSessions();

            deleteCookie(c, AUTH_CONST);

            return c.json({ success: true });
        } catch (error) {
            console.error('Logout error:', error);
            deleteCookie(c, AUTH_CONST);
            return c.json({ success: true });
        }
    })

    .post("/register", async (c) => {
        try {
            const formData = await c.req.formData();
            const inviteToken = c.req.query("inviteToken");
            const name = formData.get("name") as string;
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            const position = formData.get("position") as string;
            const productNotification = formData.get("productNotification") === "true";
            const imageFile = formData.get("imageUrl") as File | null;

            const userClient = new Client()
                .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
                .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
            const userAccount = new Account(userClient);
            const user = await userAccount.create(ID.unique(), email, password, name);

            let profileImageUrl = null;
            if (imageFile && imageFile instanceof File) {
                const { storage } = await createAdminClient();
                const file = await storage.createFile(
                    process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
                    ID.unique(),
                    imageFile
                );
                profileImageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
            }

            const { databases } = await createAdminClient();
            await databases.createDocument(
                DATABASE_ID,
                USERS_ID,
                user.$id,
                {
                    userId: user.$id,
                    name: name,
                    email: email,
                    position: position,
                    profileImage: profileImageUrl,
                    password: password,
                    productNotification: productNotification,
                    provider: "email"
                }
            );

            if (inviteToken) {
                try {
                    const inviteResult = await processInviteAcceptance(user.$id, inviteToken);
                    console.log("✅ User auto-joined workspace via invite");

                    return c.json({
                        success: true,
                        data: user,
                        invite: {
                            accepted: true,
                            workspaceId: inviteResult.workspaceId,
                            workspaceName: inviteResult.workspaceName
                        }
                    });
                } catch (inviteError) {
                    console.error("❌ Invite processing failed:", inviteError);
                }
            }

            return c.json({
                success: true,
                data: user
            });

        } catch (error) {
            console.error("Registration error:", error);
            return c.json({
                error: error instanceof Error ? error.message : "Registration failed"
            }, 500);
        }
    })

    .post("/forgot-password", zValidator("json", forgotPasswordSchema), async (c) => {
        const { email } = c.req.valid("json");

        try {
            const { databases } = await createAdminClient();

            // ✅ Step 1: Check if user exists and get provider
            console.log("🔍 Checking user provider for:", email);

            const users = await databases.listDocuments(
                DATABASE_ID,
                USERS_ID,
                [Query.equal("email", email)]
            );

            if (users.documents.length === 0) {
                return c.json({ error: "No account found with this email" }, 400);
            }

            const user = users.documents[0];
            const provider = user.provider || "email";

            console.log(" User found with provider:", provider);

            if (provider === "google") {
                console.log(" Google user trying password reset");
                return c.json({
                    error: "Password reset not allowed for social accounts.",
                    provider: "google"
                }, 400);
            }
            console.log(" Sending password reset for email user");

            const { account } = await createAdminClient();
            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
            await account.createRecovery(email, resetUrl);

            return c.json({
                message: "Reset link sent to your email",
                provider: "email"
            });

        } catch (error: unknown) {
            console.error(" Forgot password error:", error);

            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                (error as { code?: number }).code === 404
            ) {
                return c.json({ error: "Email not found" }, 400);
            }

            return c.json({ error: "Failed to send reset link" }, 500);
        }
    })

    .post("/reset-password", zValidator("json", resetPasswordSchema), async (c) => {
        const { userId, secret, password } = c.req.valid("json");

        try {
            const { account } = await createAdminClient();
            await account.updateRecovery(userId, secret, password);
            return c.json({ message: "Password reset successful" });
        } catch {
            return c.json({ error: "Invalid or expired recovery link" }, 400);
        }
    })

.post("/send-verification-code", zValidator("json", sendMagicLinkSchema), async (c) => {
    try {
        const { email } = c.req.valid("json");
        console.log("📧 Send verification code called for:", email);

        if (!TokenService.canSendCode(email)) {
            return c.json({
                error: "Please wait 60 seconds before requesting another verification code"
            }, 429);
        }

        const code = await TokenService.storeCode(email, 15); // 🔁 Make sure this returns a string

        const emailResult = await sendVerificationCode(email, code);

        if (!emailResult.success) {
            console.error("Email send failed:", emailResult.error);
            return c.json({ error: "Failed to send verification email" }, 500);
        }

        const maskedEmail = email.replace(/(.{1,3}).*(@.*)/, '$1****$2');
        console.log("✅ Verification code sent to:", maskedEmail);

        return c.json({
            message: "Verification code sent successfully",
            maskedEmail
        });

    } catch (err: any) {
        console.error("🔥 send-verification-code error:", err);
        return c.json({ error: err.message || "Internal error" }, 500);
    }
})


    .post("/verify-code", zValidator("json", z.object({
        email: z.string().email(),
        code: z.string().min(8).max(8)
    })), async (c) => {
        const { email, code } = c.req.valid("json");

        try {
            let result;

            try {
                result = await TokenService.verifyCode(code);
                console.log("✅ TokenService result:", result);
            } catch (tokenError) {
                console.error("❌ TokenService error:", tokenError);
                return c.json({ error: "Token verification failed" }, 500);
            }

            if (!result.success) {
                console.log("⚠️ Verification failed:", result.message);
                return c.json({ error: result.message }, 400);
            }

            if (result.email !== email) {
                console.log("❌ EMAIL MISMATCH DETECTED");
                console.log("From token:", result.email);
                console.log("From request:", email);
                return c.json({ error: "Invalid verification code for this email" }, 400);
            }

            console.log("✅ Code verified for email:", result.email);

            return c.json({
                success: true,
                message: result.message,
                email: result.email,
            });

        } catch (error: any) {
            console.error("❌ Code verification error:", error);
            return c.json({ error: "Code verification failed" }, 500);
        }
    })

    .post("/:workspaceId/invite-coworkers", sessionMiddleware, zValidator("json", inviteCoworkersSchema), async (c) => {
        try {
            const databases = c.get("databases");
            const user = c.get("user");
            const { invites } = c.req.valid("json");
            const workspaceId = c.req.param("workspaceId");
            const workspace = await databases.getDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );

            const createdInvitations = [];


            for (const invite of invites) {
                const token = generateUniqueToken();

                const invitation = await databases.createDocument(
                    DATABASE_ID,
                    INVITATION_ID,
                    ID.unique(),
                    {
                        email: invite.email,
                        role: invite.role,
                        workspaceId: workspaceId,
                        token: token,
                        invitedBy: user.$id,
                        status: "pending",
                        // createdAt: new Date().toISOString(),
                        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        workspaceName: workspace.name,
                        workspaceUrl: workspace.workspaceUrl
                    }
                );

                createdInvitations.push(invitation);


                await sendInviteEmail(invite.email, token, workspace.name);
            }

            return c.json({
                success: true,
                data: createdInvitations,
                message: `${invites.length} invitations sent successfully`
            });

        } catch (error) {
            console.error("Invite error:", error);
            return c.json({
                error: "Failed to send invitations"
            }, 500);
        }
    })

    .get("/invite/:token", async (c) => {
        try {
            const { databases } = await createAdminClient();
            const token = c.req.param("token");

            console.log("🔍 Fetching invite data for token:", token);

            const invitations = await databases.listDocuments(
                DATABASE_ID,
                INVITATION_ID,
                [Query.equal("token", token)]
            );

            if (invitations.documents.length === 0) {
                console.log("❌ No invitation found for token:", token);
                return c.json({
                    error: "Invalid invitation token"
                }, 404);
            }

            const invitation = invitations.documents[0];
            console.log("📧 Found invitation for:", invitation.email);

            // ✅ Rest of validation logic same
            if (new Date(invitation.expiresAt) < new Date()) {
                console.log("⏰ Invitation expired:", invitation.expiresAt);
                return c.json({
                    error: "Invitation has expired"
                }, 400);
            }

            if (invitation.status === "accepted") {
                console.log("✅ Invitation already accepted");
                return c.json({
                    error: "Invitation has already been used"
                }, 400);
            }

            // ✅ Check if user exists (without session)
            const existingUsers = await databases.listDocuments(
                DATABASE_ID,
                USERS_ID,
                [Query.equal("email", invitation.email)]
            );

            const userExists = existingUsers.documents.length > 0;
            console.log("👤 User exists:", userExists);

            return c.json({
                success: true,
                data: {
                    email: invitation.email,
                    role: invitation.role,
                    workspaceId: invitation.workspaceId,
                    workspaceName: invitation.workspaceName,
                    workspaceUrl: invitation.workspaceUrl,
                    userExists: userExists,
                    invitedBy: invitation.invitedBy,
                    expiresAt: invitation.expiresAt
                }
            });

        } catch (error) {
            console.error("❌ Fetch invite error:", error);
            return c.json({
                error: "Failed to fetch invitation details"
            }, 500);
        }
    })

export default app;