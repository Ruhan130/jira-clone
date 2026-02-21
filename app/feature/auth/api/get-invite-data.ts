import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";


type InviteValidationResponse = InferResponseType<typeof client.api.auth.invite[":token"]["$get"]>;
type InviteValidationRequest = InferRequestType<typeof client.api.auth.invite[":token"]["$get"]>;

export const useValidateInvite = () => {
    const query = useMutation<InviteValidationResponse, Error, { token: string }>({
        mutationFn: async ({ token }) => {
            const response = await client.api.auth.invite[":token"].$get({
                param: { token }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = 'error' in errorData ? errorData.error : 'Failed to validate invite';
                throw new Error(errorMessage);
            }
            
            return await response.json();
        }
    });
    
    return query;
};