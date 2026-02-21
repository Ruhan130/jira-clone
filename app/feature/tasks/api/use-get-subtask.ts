import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetSubtasks = (workspaceId: string, taskId: string) => {
    return useQuery({
        queryKey: ["subtasks", workspaceId, taskId],
        queryFn: async () => {
            const response = await client.api.tasks[":workspaceId"][":taskId"]["subtasks"]["$get"]({
                param: {
                    workspaceId: workspaceId,
                    taskId: taskId
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch subtasks");
            }

            const { data } = await response.json();
            return data;
        },
    });
};