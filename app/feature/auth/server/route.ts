import z from "zod"
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie";
import { AUTH_CONST } from "../constant";

const app = new Hono().post("/login", zValidator("json", loginSchema), async (c) => {

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
    .post("/logout", (c) => {
        deleteCookie(c, AUTH_CONST);
        return c.json({ success: true })
    })


    .post("/register", zValidator("json", registerSchema), async (c) => {
        const { name, email, password } = c.req.valid("json");

        const { account } = await createAdminClient();
        const user = account.create(
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
            secure: true,
            sameSite: "Strict",
            maxAge: 60 * 60 * 24 * 30
        });

        return c.json({ data: user });
    })


    ;

export default app;