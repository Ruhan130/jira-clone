import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query"; // 👈 useQuery use karo, useMutation nahi


export const useGetTeams = ({ workspaceId }: { workspaceId: string }) => {
    const query = useQuery({
        queryKey: ["teams", workspaceId], // 👈 workspaceId include karo
        queryFn: async () => {
            const response = await client.api.teams[":workspaceId"]["$get"]({
                param: { workspaceId } // 👈 param pass karo
            });

            if (!response.ok) {
                throw new Error("Failed to fetch teams");
            }

            const { data } = await response.json();
            return data;
        },
    });

    return query;
};