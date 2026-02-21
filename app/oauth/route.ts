import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONST } from "../feature/auth/constant";
import { DATABASE_ID, USERS_ID } from "@/config";
import { Query } from "node-appwrite";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    if (!userId || !secret) {
        return new NextResponse("Missing field", { status: 400 });
    }

    try {
        const { account } = await createAdminClient();
        const session = await account.createSession(userId, secret);

        cookies().set(AUTH_CONST, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });


        await saveOAuthUserData(userId);

        return NextResponse.redirect(`${request.nextUrl.origin}/`);
    } catch (error) {
        console.error("OAuth callback error:", error);
        return NextResponse.redirect(`${request.nextUrl.origin}/sign-in?error=oauth_failed`);
    }
}
async function saveOAuthUserData(userId: string) {
    try {
        const { databases } = await createAdminClient();
        const { users } = await createAdminClient();
        const user = await users.get(userId);

        const existingUsers = await databases.listDocuments(
            DATABASE_ID,
            USERS_ID,
            [Query.equal("email", user.email)]
        );

        if (existingUsers.documents.length === 0) {

            const newUser = await databases.createDocument(
                DATABASE_ID,
                USERS_ID,
                user.$id,
                {
                    userId: user.$id,
                    name: user.name,
                    email: user.email,
                    position: "",
                    profileImage: user.prefs?.picture || null,
                    provider: "google",
                    productNotification: false,
                    password: ""
                }
            );


        } else {
            console.log("OAuth user already exists:", user.email);
        }

    } catch (error) {
        console.error("Error details:", error);
    }
}