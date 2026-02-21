import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetComments = (subtaskId: string) => {
    const query = useQuery({
        queryKey: ["comments", subtaskId],
        queryFn: async () => {
            const response = await client.api.tasks[":subtaskId"]["comments"]["$get"]({
                param: { subtaskId }
            });
            console.log("API response status:", response.status);
            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            const result = await response.json();
            console.log("API response data:", result);
            return result.data;
        }
    });
    return query;
};