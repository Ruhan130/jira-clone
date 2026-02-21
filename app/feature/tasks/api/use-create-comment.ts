import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks[":subtaskId"]["create-comment"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[":subtaskId"]["create-comment"]["$post"]>;

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.tasks[":subtaskId"]["create-comment"]["$post"]({
                json,
                param
            });

            if (!response.ok) {
                throw new Error("Failed to create comment");
            }

            return await response.json();
        },
        onSuccess: (data, variables) => {
            // queryClient.invalidateQueries({
            //     queryKey: ["comments", variables.param.subtaskId]
            // });
            // ✅ Alternative: More specific invalidation
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.param.subtaskId],
                exact: true // Force exact match
            });
            toast.success("Comment added successfully");
        },
        onError: () => {
            toast.error("Failed to add comment");
        }
    });

    return mutation;
};