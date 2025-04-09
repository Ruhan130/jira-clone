import {
    Client, Users, Account, Storage, Databases
} from 'node-appwrite';


export async function createAdminClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setKey(process.env.NEXT_APPWRITE_KEY!)

    return {
        get Account() {
            return new Account(client);
        }
    }


}