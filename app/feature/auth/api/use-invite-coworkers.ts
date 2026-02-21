import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


type RequestType = InferRequestType<typeof client.api.auth[":workspaceId"]["invite-coworkers"]["$post"]>;
type ResponseType = InferResponseType<typeof client.api.auth[":workspaceId"]["invite-coworkers"]["$post"]>;

export const useInviteCoworkers = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.auth[":workspaceId"]["invite-coworkers"]["$post"]({
                param,
                json
            });

            if (!response.ok) {
                throw new Error("Failed to send invitations");
            }

            return await response.json();
        },
        onSuccess: (data) => {
            toast.success("Invitations sent successfully!");
            queryClient.invalidateQueries({ queryKey: ["workspace"] });
        },
        onError: (error) => {
            toast.error("Failed to send invitations");
        }
    });

    return mutation;
};