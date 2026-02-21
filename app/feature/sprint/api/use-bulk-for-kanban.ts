import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.sprint[":workspaceId"]["sprint"][":sprintId"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.sprint[":workspaceId"]["sprint"][":sprintId"]["$post"]>;

export const useAddTaskToSprint = () => {
    const queryClient = useQueryClient();
    
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => { // ✅ param add kiya
            const response = await client.api.sprint[":workspaceId"]["sprint"][":sprintId"]["$post"]({
                json,
                param // ✅ { workspaceId, sprintId }
            });
            
            if (!response.ok) {
                throw new Error("Failed to add task to sprint");
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Task is successfully added in sprint");
            queryClient.invalidateQueries({ queryKey: ["sprint"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: () => {
            toast.error("Failed to add Task");
        }
    });
    
    return mutation;
};