import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.projects["$post"]>;
type RequestType = InferRequestType<typeof client.api.projects["$post"]>;

export const useCreateProject = () => {

    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async ({ form }) => {
                const response = await client.api.workspaces["$post"]({ form });
                if (!response.ok) {
                    throw new Error("Failed to create Project");
                }
                return await response.json();
            },
            onSuccess: () => {
                toast.success("Projects created");
                queryClient.invalidateQueries({ queryKey: ["projects"] });
            },
            onError: () => {
                toast.error("Failed to create Projects");
            }
        }
    );
    return mutation;
}

