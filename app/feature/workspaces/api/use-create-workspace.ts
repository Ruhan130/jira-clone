import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";


type ResponseType = InferResponseType<typeof client.api.workspaces["$post"]>;
type RequestType = InferRequestType<typeof client.api.workspaces["$post"]>;

export const uceWorkspace = () => {

    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async ({ json }): Promise<ResponseType> => {
                const response = await client.api.workspaces["$post"]({ json });
                return await response.json() as ResponseType;
            },
            onSuccess: () => {

                queryClient.invalidateQueries({ queryKey: ["workspace"] });
            }
        }
    );
    return mutation;
}

