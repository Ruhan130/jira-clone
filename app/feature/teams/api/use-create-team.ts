import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner"; // 👈 Toast import add karo
import { useRouter } from "next/navigation"; // 👈 Router import add karo

type ResponseType = InferResponseType<typeof client.api.teams[":workspaceId"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.teams[":workspaceId"]["$post"]>;

export const useCreateTeam = () => { // 👈 Typo fix: useCreaetTeam → useCreateTeam
  const queryClient = useQueryClient();
  const router = useRouter(); // 👈 Router hook use karo

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => { // 👈 param bhi destructure karo
      const response = await client.api.teams[":workspaceId"]["$post"]({
        form,
        param // 👈 workspaceId param pass karo
      });

      if (!response.ok) { // 👈 Simplified condition
        throw new Error("Failed to create team"); // 👈 Correct error message
      }

      return await response.json();
    },

    onSuccess: () => {
      toast.success("Team created successfully"); // 👈 Correct success message
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["teams"] }); // 👈 Teams query invalidate karo
    },

    onError: () => {
      toast.error("Failed to create team"); // 👈 Correct error message
    }
  });

  return mutation; // 👈 mutation return karo
};