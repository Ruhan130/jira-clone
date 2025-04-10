import { cookies } from "next/headers";
import { Account, Client } from "node-appwrite"
import { AUTH_CONST } from "./constant";

export const getCurrent = async () => {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
        const sesion = await cookies().get(AUTH_CONST);
        if (!sesion) return null;
        client.setSession(sesion.value); 
        const account = new Account(client);
        return await account.get();
    } catch {

    }
}