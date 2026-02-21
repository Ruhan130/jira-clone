
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"; 
import { client } from "@/lib/rpc";

type VerifyCodePayload = {
  email: string;
  code: string;
};

type VerifyCodeResponse = {
  success: boolean;
  message: string;
  email: string;
};

// Hook for verifying 8-digit code
export const useVerifyCode = () => {
  const mutation = useMutation<VerifyCodeResponse, Error, VerifyCodePayload>({
    mutationFn: async (values) => {
      const response = await client.api.auth["verify-code"]["$post"]({
        json: values,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('error' in errorData ? errorData.error : "Failed to verify code");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid verification code");
    },
  });

  return mutation;
};