
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.sprint[":workspaceId"]["edit-sprint"][":sprintId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.sprint[":workspaceId"]["edit-sprint"][":sprintId"]["$patch"]>;


export const useUpdateSprint = () => {


    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async ({ json, param }) => {
                const response = await client.api.sprint[":workspaceId"]["edit-sprint"][":sprintId"]["$patch"]({ json, param });

                if (!response.ok) {
                    throw new Error("Failed to update ");
                }
                return await response.json();
            },
            onSuccess: ({ data }) => {
                toast.success("Sprint Updated");
                queryClient.invalidateQueries({ queryKey: ["edit-sprint", data.$id] });
            },
            onError: () => {
                toast.error("Failed to Update Sprint");
            }
        }
    );
    return mutation;
}

