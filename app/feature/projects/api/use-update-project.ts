import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";



type ResponseType = InferResponseType<typeof client.api.projects[":projectId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.projects[":projectId"]["$patch"]>;

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            console.log("🔧 Update API Call to:", `/api/projects/${param.projectId}`);
            console.log("📦 Update data:",);

            const response = await client.api.projects[":projectId"]["$patch"]({
                json,
                param: { projectId: param.projectId }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log("❌ Update error:", errorText);
                throw new Error(errorText || "Failed to Update Project");
            }

            const result = await response.json();
            console.log("✅ Update success:", result);
            return result;
        },
        onSuccess: ({ data }) => {
            toast.success("Project Updated Successfully!");

            // ✅ Enhanced query invalidation
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project", data.$id] });
            queryClient.invalidateQueries({ queryKey: ["projects", data.workspaceId] });
        },
        onError: (error: Error) => {
            console.error("❌ Update mutation error:", error);
            toast.error(error.message || "Failed to Update Project");
        }
    });

    return mutation;
};