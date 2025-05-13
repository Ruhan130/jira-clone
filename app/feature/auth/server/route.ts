
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie";
import { AUTH_CONST } from "../constant";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono()
    .get(
        "/current", sessionMiddleware,
        (c) => {
            const user = c.get("user");
            return c.json({ data: user });
        }
    )
    .post("/login", zValidator("json", loginSchema), async (c) => {

        const { email, password } = c.req.valid("json");
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(
            email,
            password
        );
        setCookie(
            c, AUTH_CONST, session.secret, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 60 * 60 * 24 * 30
        }
        )



        return c.json({ success: true });
    })
    .post("/logout", sessionMiddleware, async (c) => {

        const account = c.get("account");
        deleteCookie(c, AUTH_CONST);
        await account.deleteSession("current");
        return c.json({ success: true });
    })


    .post("/register", zValidator("json", registerSchema), async (c) => {
        const isLocal = process.env.IS_LOCAL === 'true';
        const { name, email, password } = c.req.valid("json");

        try {
            const { account } = await createAdminClient();
            const user = await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            const session = await account.createEmailPasswordSession(
                email,
                password
            );

            setCookie(
                c, AUTH_CONST, session.secret, {
                path: "/",
                httpOnly: true,
                secure: !isLocal,
                sameSite: "Lax",
                maxAge: 60 * 60 * 24 * 30
            }
            );

            return c.json({ data: user });

        } catch (error: any) {
            // Appwrite specific error code for duplicate email is 409
            if (error.code === 409) {
                return c.json(
                    { error: "Email is already registered" },
                    400
                );
            }

            return c.json(
                { error: "Something went wrong" },
                500
            );
        }
    }
    ).post("/forgot-password", zValidator("json", forgotPasswordSchema), async (c) => {
        const { email } = c.req.valid("json");

        try {
            const { account } = await createAdminClient();
            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`;
            await account.createRecovery(email, resetUrl);

            return c.json({ message: "Reset link sent to your email" });
        } catch (error: any) {
            if (error.code === 404) {
                return c.json({ error: "Email not found" }, 400);
            }
            return c.json({ error: "Failed to send reset link" }, 500);
        }
    }
    )
    .post("/reset-password", zValidator("json", resetPasswordSchema), async (c) => {
        const { userId, secret, password } = c.req.valid("json");

        try {
            const { account } = await createAdminClient();
            await account.updateRecovery(userId, secret, password);
            return c.json({ message: "Password reset successful" });
        } catch (error: any) {
            return c.json({ error: "Invalid or expired recovery link" }, 400);
        }
    });



export default app;