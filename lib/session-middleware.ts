import "server-only"
import {
    Account,
    Client,
    Databases,
    Models,
    Storage,
    type Account as AccountType,
    type Databases as DatabasesTypem,
    type Storage as StorageType,
    type Users as UserType
} from "node-appwrite"

import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { AUTH_CONST } from "@/app/feature/auth/constant";

type AdditionalContext = {
    Variables: {
        account: AccountType;
        databases: Databases;
        storage: Storage;
        users: UserType;
        user: Models.User<Models.Preferences>;
    }
}


export const sessionMiddleware = createMiddleware<AdditionalContext>(
    async (c, next) => {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

        const session = getCookie(c, AUTH_CONST);

        if (!session) {
            return c.json({ error: "Unauthorized - No session cookie" }, 401);
        }

        client.setSession(session);

        const account = new Account(client);
        const storage = new Storage(client);
        const databases = new Databases(client);

        let user;

        try {
            user = await account.get();
        } catch (error) {
            console.error("Appwrite account.get() failed:", error);
            return c.json({ error: "Unauthorized - Invalid session or server error" }, 401);
        }

        c.set("account", account);
        c.set("storage", storage);
        c.set("databases", databases);
        c.set("user", user);

        await next();
    }
);

// export const sessionMiddleware = createMiddleware<AdditionalContext>(
//     async (c, next) => {
//         const client = new Client()
//             .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
//             .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);


//         const session = getCookie(c, AUTH_CONST)

//         if (!session) {
//             return c.json({ error: "Unuthorized " }, 401)

//         };

//         client.setSession(session);

//         const account = new Account(client);
//         const storage = new Storage(client);
//         const databases = new Databases(client);

//         const user = await account.get();


//         c.set("account", account);
//         c.set("storage", storage);
//         c.set("databases", databases);
//         c.set("user", user);

//         await next();

//     }
// )