import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.sprint[":workspaceId"]["$post"], 200>
type RequestType = InferRequestType<typeof client.api.sprint[":workspaceId"]["$post"]>


export const UseCreateSprint = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.sprint[":workspaceId"]["$post"]({ json, param });

            if (!response.ok) {
                throw new Error("Failed to Create Sprint");
            }
            return await response.json();
        }, onSuccess: ({ data }) => {
            toast.success("Sprint Created ");
            queryClient.invalidateQueries({ queryKey: ["sprint"] });
            router.refresh();
        },
        onError: () => {
            toast.error("Failed to Create Sprint");
        }

    });
    return mutation;

}