import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks["comments"][":commentId"]["reactions"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks["comments"][":commentId"]["reactions"]["$patch"]>;

export const useReactToComment = () => {
    const queryClient = useQueryClient();
    
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.tasks["comments"][":commentId"]["reactions"]["$patch"]({
                json,
                param
            });
            
            if (!response.ok) {
                throw new Error("Failed to update reaction");
            }
            
            const result = await response.json();
            return result;
        },
        onSuccess: (data, variables) => {           
            queryClient.invalidateQueries({ queryKey: ["comments"] });
            queryClient.invalidateQueries({ queryKey: ["comment", variables.param.commentId] });
            queryClient.invalidateQueries({ queryKey: ["task-comments"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            
           
            queryClient.refetchQueries({ queryKey: ["comments"] });
            toast.success("Reaction updated!");
        },
        onError: (error) => {
            toast.error("Failed to update reaction");
        }
    });
    
    return mutation;
};