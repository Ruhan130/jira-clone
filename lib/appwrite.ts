import "server-only"
import {
    Client, Users, Account, Storage, Databases
} from 'node-appwrite';
import { cookies } from "next/headers";
import { AUTH_CONST } from "@/app/feature/auth/constant";


export async function createSessionClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
    const session = await cookies().get(AUTH_CONST);

    if (!session || !session.value) {
        throw new Error("Unauthorized");
    }

    client.setSession(session.value);

    return {
        get account() {
            return new Account(client);
        },

        get databases() {
            return new Databases(client);
        }
    };

}

export async function createAdminClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setKey(process.env.NEXT_APPWRITE_KEY!)

    return {
        get account() {
            return new Account(client);
        },
        get users() {
            return new Users(client);
        }
    };


};

export async function createAdimnClientForMicrosoft() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_MICROSOFT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setKey(process.env.NEXT_APPWRITE_KEY!)

    return {
        get account() {
            return new Account(client);
        },
        get users() {
            return new Users(client);
        }
    };


};