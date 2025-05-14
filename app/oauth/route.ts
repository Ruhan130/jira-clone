// src/app/oauth/route.js

import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONST } from "../feature/auth/constant";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    if (!userId || !secret) {
        return new NextResponse("Missing field", { status: 400 });
    }

    const { account } = await createAdminClient();
    const session = await account.createSession(userId, secret);

    cookies().set(AUTH_CONST, session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    return NextResponse.redirect(`${request.nextUrl.origin}/`);
}
