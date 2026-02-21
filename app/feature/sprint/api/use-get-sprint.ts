import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { Sprint } from "../type";

interface useGetSprintProps {
    workspaceId: string;
    sprintId: string;
}

export const useGetSprint = ({ workspaceId, sprintId }: useGetSprintProps) => {
    return useQuery({
        queryKey: ["sprint", workspaceId, sprintId],
        queryFn: async () => {
            const res = await client.api.sprint[":workspaceId"]["sprint"][":sprintId"]["$get"]({
                param: {
                    workspaceId,
                    sprintId,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch sprint");
            }

            const { data } = await res.json();
            return data as Sprint;
        },
        enabled: !!workspaceId && !!sprintId,
    });
};

