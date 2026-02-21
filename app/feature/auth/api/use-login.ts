import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>;

interface LoginResponse {
    success: boolean;
    redirectTo?: string;
    workspaceId?: string;
}

interface UseLoginParams {
    inviteToken?: string;
}

export const useLogin = ({ inviteToken }: UseLoginParams = {}) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    
    const mutation = useMutation<LoginResponse, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const url = inviteToken 
                ? `/api/auth/login?inviteToken=${inviteToken}`
                : `/api/auth/login`;
                
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json)
            });
                
            if (!response.ok) {
                throw new Error("Failed to login");
            }
            return await response.json();
        },
        onSuccess: (data: LoginResponse) => {
            toast.success("Logged in");
            if (data.redirectTo === "workspace" && data.workspaceId) {
                toast.success("Successfully joined workspace!");
                router.push(`/workspaces/${data.workspaceId}`);
            } else {
                router.push("/");
            }
            
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ["current"] });
        },
        onError: (error) => {
            toast.error("Failed to log in");
        }
    });
    
    return mutation;
};