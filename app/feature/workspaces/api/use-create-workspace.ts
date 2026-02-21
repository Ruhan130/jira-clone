import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.workspaces["$post"]>;
type RequestType = InferRequestType<typeof client.api.workspaces["$post"]>;

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ form }) => {
            const response = await client.api.workspaces["$post"]({ form });
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = typeof data === 'object' && 'error' in data
                    ? data.error
                    : "Failed to create workspace";
                throw new Error(errorMessage);
            }

            return data;
        },
        onSuccess: () => {
            toast.success("Workspace created successfully!");
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ["workspace"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return mutation;
};