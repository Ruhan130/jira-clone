import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/lib/rpc";

interface useGetProjectAnalyticsProps {
    workspaceId: string;
}

export type projectAnalyticsResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["analytics"]["$get"], 200>;

export const useGetProjectAnalytics = ({ workspaceId }: useGetProjectAnalyticsProps) => {
    const query = useQuery({
        queryKey: ["project-analytics", workspaceId],
        queryFn: async () => {
            const response = await client.api.workspaces[":workspaceId"]["analytics"].$get(
                {
                    param: { workspaceId },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch workspace analytics");

            }

            const { data } = await response.json();

            return data;
        }
    }
    );
    return query;
}