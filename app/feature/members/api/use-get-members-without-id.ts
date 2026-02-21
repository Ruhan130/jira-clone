"use client";

import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetAllMembers = () => {
    return useQuery({
        queryKey: ["all-members"],
        queryFn: async () => {
            const response = await client.api.members["all"].$get(); // ✅ no query needed
            if (!response.ok) {
                throw new Error("Failed to fetch all members");
            }
            const { data } = await response.json();
            return data;
        }
    });
};


