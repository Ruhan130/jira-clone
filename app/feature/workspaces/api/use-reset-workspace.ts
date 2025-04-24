import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["rest-invite-code"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["rest-invite-code"]["$post"]>;

export const useResetWorkspace = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async ({ param }) => {
                const response = await client.api.workspaces[":workspaceId"]["rest-invite-code"]["$post"]({ param });
                if (!response.ok) {
                    throw new Error("Failed to Reset Invite workpsace");
                }
                return await response.json();
            },
            onSuccess: ({ data }) => {
                toast.success("Inivite code reset");
                router.refresh();
                queryClient.invalidateQueries({ queryKey: ["workspace"] });
                queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
            },
            onError: () => {
                toast.error("Failed to reset invite code");
            }
        }
    );
    return mutation;
}