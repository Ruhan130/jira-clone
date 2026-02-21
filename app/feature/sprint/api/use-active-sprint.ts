import { client } from "@/lib/rpc";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type RequestType = InferRequestType<typeof client.api.sprint[":workspaceId"]["active-sprint"][":sprintId"]["$post"]>;

type ResponseType = InferResponseType<typeof client.api.sprint[":workspaceId"]["active-sprint"][":sprintId"]["$post"], 200>;

export const useActiveSprint = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.sprint[":workspaceId"]["active-sprint"][":sprintId"]["$post"]({ param });

            if (!response.ok) {
                throw new Error("Failed to activate Sprint");
            }

            return await response.json(); 
        },
        onSuccess: () => {
            toast.success("Sprint started successfully");
            queryClient.invalidateQueries({ queryKey: ["sprint"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: () => {
            toast.error("Failed to start sprint");
        }
    });

    return mutation;
};
