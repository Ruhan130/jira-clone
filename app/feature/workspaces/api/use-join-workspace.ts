import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"]>;

export const useJoinWorkspace = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.workspaces[":workspaceId"]["join"]["$post"]({ param, json });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    (errorData && "error" in errorData && typeof errorData.error === "string")
                        ? errorData.error
                        : "Failed to join workspace"
                );
            }

            return await response.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Joined workspace");
            queryClient.invalidateQueries({ queryKey: ["workspace"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    return mutation;
}