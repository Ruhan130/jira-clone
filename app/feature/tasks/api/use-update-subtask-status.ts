import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks[":workspaceId"][":taskId"]["subtasks"][":subtaskId"]["$patch"], 200>
type RequestType = InferRequestType<typeof client.api.tasks[":workspaceId"][":taskId"]["subtasks"][":subtaskId"]["$patch"]>


export const useUpdateSubtaskStatus = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async ({ json, param }) => {
                const response = await client.api.tasks[":workspaceId"][":taskId"]["subtasks"][":subtaskId"]["$patch"]({ json, param });

                if (!response.ok) {
                    throw new Error("Failed to Update ");
                }

                return await response.json();
            },
            onSuccess: () => {
                // toast("Subtask Updated");
                queryClient.invalidateQueries({ queryKey: ["subtasks"] });

            },
            onError: () => {
                toast("Failed to  Update subtask");
            }
        }
    )
    return mutation;
}