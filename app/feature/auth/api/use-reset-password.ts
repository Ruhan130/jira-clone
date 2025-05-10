import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { client } from "@/lib/rpc"; // Update the import based on your client config

type ResetPasswordPayload = {
    userId: string;
    secret: string;
    password: string;
};

type ResetPasswordResponse = {
    message: string;
};

export const useResetPassword = () => {
    const router = useRouter();

    const mutation = useMutation<ResetPasswordResponse, Error, ResetPasswordPayload>(
        {
            mutationFn: async (values) => {
                const response = await client.api.auth["reset-password"]["$post"]({
                    json: values,
                });

                if (!response.ok) {
                    throw new Error("Failed to reset password");
                }

                return await response.json();
            },
            onSuccess: () => {
                toast.success("Password reset successful");
                router.push("/login");
            },
            onError: (error: Error) => {
                toast.error(error.message || "Failed to reset password");
            },
        }
    );

    return mutation;
};
