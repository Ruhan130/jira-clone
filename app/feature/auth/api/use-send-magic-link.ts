import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"; 
import { client } from "@/lib/rpc";

// Types
type SendVerificationPayload = {
  email: string;
};

type SendVerificationResponse = {
  message: string;
  maskedEmail: string;
};


export const useSendVerificationCode = () => {
  const mutation = useMutation<SendVerificationResponse, Error, SendVerificationPayload>({
    mutationFn: async (values) => {
      const response = await client.api.auth["send-verification-code"]["$post"]({
        json: values,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('error' in errorData ? errorData.error : "Failed to send verification email");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success(`Verification email sent to ${data.maskedEmail}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send verification email");
    },
  });

  return mutation;
};