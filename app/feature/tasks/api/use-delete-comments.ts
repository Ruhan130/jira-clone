import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks[":commentId"]["delete-comments"]["$delete"], 200>
type RequestType = InferRequestType<typeof client.api.tasks[":commentId"]["delete-comments"]["$delete"]>

export const useDeleteComment = () => {
    const query = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async ({ param }) => {
                const response = await client.api.tasks[":commentId"]["delete-comments"]["$delete"]({ param });


                if (!response.ok) {
                    throw new Error("Failed to Delete Task");
                }

                return await response.json();
            },
            onSuccess: () => {
                toast("Comment Deleted Successsfully");
                query.invalidateQueries({ queryKey: ["comments"] })
            }
        }
    )
    return mutation;
}