import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch(`/api/projects/${data.workspaceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success("Project created successfully!");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            router.push(`/`)
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
};


