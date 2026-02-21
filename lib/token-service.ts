
import { DATABASE_ID, TOKENCODES_ID } from "@/config";
import { ID, Query } from "appwrite";
import { createAdminClient } from "./appwrite";



export class TokenService {
  static generateToken(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  static async storeCode(email: string, expiryMinutes: number = 15): Promise<string> {
    const { databases } = await createAdminClient();
    const code = this.generateToken();
    const expires = Date.now() + expiryMinutes * 60 * 1000;
    const existing = await databases.listDocuments(DATABASE_ID, TOKENCODES_ID, [
      Query.equal("email", email),
    ]);

    for (const doc of existing.documents) {
      await databases.deleteDocument(DATABASE_ID, TOKENCODES_ID, doc.$id);
    }

    await databases.createDocument(DATABASE_ID, TOKENCODES_ID, ID.unique(), {
      code,
      email,
      expires,
      verified: false,
      createdAt: Date.now(),
    });

    console.log("🔢 Code stored in Appwrite:", { email, code, expires: new Date(expires) });
    return code;
  }

  static async verifyCode(code: string): Promise<{
    success: boolean;
    email?: string;
    message: string;
  }> {
    const { databases } = await createAdminClient();
    const result = await databases.listDocuments(DATABASE_ID, TOKENCODES_ID, [
      Query.equal("code", code),
    ]);

    if (result.documents.length === 0) {
      return { success: false, message: "Invalid verification code" };
    }

    const codeDoc = result.documents[0];

    if (codeDoc.expires < Date.now()) {
      await databases.deleteDocument(DATABASE_ID, TOKENCODES_ID, codeDoc.$id);
      return { success: false, message: "Verification code has expired" };
    }

    if (codeDoc.verified) {
      return { success: false, message: "This verification code has already been used" };
    }

    await databases.deleteDocument(DATABASE_ID, TOKENCODES_ID, codeDoc.$id);

    return {
      success: true,
      email: codeDoc.email,
      message: "Email verified successfully",
    };
  }

  static async removeTokensByEmail(email: string) {
    const { databases } = await createAdminClient();
    const result = await databases.listDocuments(DATABASE_ID, TOKENCODES_ID, [
      Query.equal("email", email),
    ]);

    for (const doc of result.documents) {
      await databases.deleteDocument(DATABASE_ID, TOKENCODES_ID, doc.$id);
    }
  }

  static async canSendCode(email: string): Promise<boolean> {
    const { databases } = await createAdminClient();
    const result = await databases.listDocuments(DATABASE_ID, TOKENCODES_ID, [
      Query.equal("email", email),
      Query.orderDesc("createdAt"),
      Query.limit(1),
    ]);

    if (result.documents.length === 0) return true;

    const latest = result.documents[0];
    return Date.now() - latest.createdAt > 60 * 1000;
  }
}
