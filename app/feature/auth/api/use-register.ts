import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";

export const useRegister = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const urlParams = new URLSearchParams(window.location.search);
            const inviteToken = urlParams.get("invite");

            const apiUrl = inviteToken
                ? `/api/auth/register?inviteToken=${inviteToken}`
                : `/api/auth/register`;

            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Registration failed");
            }

            const data = await response.json();
            return { data, formData };
        },
        onSuccess: async ({ data, formData }) => {
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            if (data.invite?.accepted) {
                toast.success(`Welcome to ${data.invite.workspaceName}!`);

                try {
                    const loginResponse = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });

                    if (loginResponse.ok) {
                        router.refresh();
                        queryClient.invalidateQueries({ queryKey: ["current"] });


                        router.replace("/workspaces/welcome");
                    } else {
                        throw new Error("Auto-login after invite failed");
                    }
                } catch (err) {
                    toast.success("Registration successful! Please sign in.");
                    router.push("/sign-in");
                }

                return;
            }

            // Normal flow:
            try {
                const loginResponse = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (loginResponse.ok) {
                    router.refresh();
                    queryClient.invalidateQueries({ queryKey: ["current"] });
                    router.replace("/workspaces/create");
                } else {
                    throw new Error("Auto-login failed");
                }
            } catch (err) {
                toast.success("Registration successful! Please sign in.");
                router.push("/sign-in");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return mutation;
};