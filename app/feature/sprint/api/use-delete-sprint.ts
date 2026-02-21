import { client } from "@/lib/rpc";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.sprint[":workspaceId"]["delete-sprint"][":sprintId"]["$delete"], 200>
type RequestType = InferRequestType<typeof client.api.sprint[":workspaceId"]["delete-sprint"][":sprintId"]["$delete"]>



export const useDeleteSprint = () => {
    const router = useRouter();
    const mutation = useMutation<ResponseType, Error, RequestType>({

        mutationFn: async ({ param }) => {
            const response = await client.api.sprint[":workspaceId"]["delete-sprint"][":sprintId"]["$delete"]({
                param,
            });

            if (!response.ok) {
                throw new Error("Failed to Delete");
            }

            return await response.json();
        },

        onSuccess: () => {
            toast.success("Sprint Deleted");
            router.refresh();

        },

        onError: () => {
            toast.error("Failed to Delete Sprint");
        },
    });

    return mutation;
};
