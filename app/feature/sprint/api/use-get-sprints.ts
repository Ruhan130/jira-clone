import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query"

export const UseGetSprints = ({ workspaceId }: { workspaceId: string }) => {
    const query = useQuery({
        queryKey: ["sprint", workspaceId],
        queryFn: async () => {
            const response = await client.api.sprint[":workspaceId"]["$get"]({
                param: { workspaceId }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch sprints");
            }

            const { data } = await response.json();
            return data;
        },

    });

    return query;
};