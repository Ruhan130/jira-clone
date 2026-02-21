

import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

type CheckUserPayload = {
  email: string;
};

type CheckUserResponse = {
  exists: boolean;
  isNewUser: boolean;
  provider?: "email" | "google";
};

export const useCheckUser = () => {
  const mutation = useMutation<CheckUserResponse, Error, CheckUserPayload>({
    mutationFn: async (values) => {
      const response = await client.api.auth["check-user"]["$post"]({
        json: values,
      });

      if (!response.ok) {
        throw new Error("Failed to check user");
      }

      return await response.json();
    },
  });

  return mutation;
};