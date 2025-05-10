import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
 // adjust path if different

type RequestType = InferRequestType<typeof client.api.auth["forgot-password"]["$post"]>;
type ResponseType = InferResponseType<typeof client.api.auth["forgot-password"]["$post"]>;

export const useForgotPassword = () => {
  const router = useRouter();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["forgot-password"]["$post"]({ json });

      const data = await response.json();
      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Failed to send reset link");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Reset link sent to your email");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
