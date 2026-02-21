import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks[":workspaceId"][":taskId"]["subtask"]["$post"], 200>
type RequestType = InferRequestType<typeof client.api.tasks[":workspaceId"][":taskId"]["subtask"]["$post"]>


export const useCreateSubTask = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async ({ json, param }) => {

                const response = await client.api.tasks[":workspaceId"][":taskId"]["subtask"]["$post"]({ json, param });
                if (!response.ok) {
                    throw new Error("Failed to update tasks ");
                }
                return await response.json();
            },
            onSuccess: () => {
                toast.success("Subtask created successfully");
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                queryClient.invalidateQueries({ queryKey: ["subtasks"] });
            },
            onError: () => {
                toast.error("Failed to create Task");
            }
        }
    )
    return mutation;
}
