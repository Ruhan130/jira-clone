import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { TaskType } from "../types";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";



type ResponseType = InferResponseType<typeof client.api.tasks["bulk-update"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks["bulk-update"]["$post"]>;

export const useBulkUpdateTask = () => {
    const queryClient = useQueryClient();
    const workpsaceId = UseWorkspaceId();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {


            const tasksToValidate = json.tasks.filter(task => task.status === TaskType.DONE);
            for (const task of tasksToValidate) {
                const validation = await validateTaskCompletion(workpsaceId, task.$id);

                if (!validation.canComplete) {
                    toast.error(
                        `Cannot complete task! ${validation.incompleteCount} subtasks are still pending.`
                    );
                    throw new Error("Frontend validation failed");
                }
            }

            const response = await client.api.tasks["bulk-update"]["$post"]({ json });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage =
                    "error" in errorData
                        ? errorData.error
                        : "Failed to update tasks";
                throw new Error(errorMessage);
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Task updated");

            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
            queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error: Error) => {
            if (error.message !== "Frontend validation failed") {
                toast.error(error.message || "Failed to update tasks");
            }
        }
    });

    return mutation;
};


export const validateTaskCompletion = async (taskId: string, workspaceId: string) => {
    try {
        const response = await client.api.tasks[":workspaceId"][":taskId"]["subtasks"]["$get"]({
            param: { taskId, workspaceId }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch subtasks");
        }

        const result = await response.json();
        const subtasks = result.data || [];

        const incompleteSubtasks = subtasks.filter(
            (subtask: any) => subtask.status !== "DONE"
        );

        return {
            canComplete: incompleteSubtasks.length === 0,
            incompleteCount: incompleteSubtasks.length,
            incompleteSubtasks: incompleteSubtasks
        };
    } catch (error) {
        console.error("Validation error:", error);
        return { canComplete: true, incompleteCount: 0, incompleteSubtasks: [] };
    }
};