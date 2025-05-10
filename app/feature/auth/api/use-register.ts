import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


type RegisterResponse =
    | { data: any }
    | { error: string };


type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>;

export const useRegister = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async ({ json }) => {
                const response = await client.api.auth.register["$post"]({ json });
                const data: RegisterResponse = await response.json();
                if (!response.ok && "error" in data) {
                    throw new Error(data.error || "Registration failed");
                }

                return data;
            },
            onSuccess: () => {
                toast.success("Registered");
                router.refresh();
                queryClient.invalidateQueries({ queryKey: ["current"] });
            },
            onError: (error: Error) => {
                toast.error(error.message);
            }
        }
    );
    return mutation;
}
