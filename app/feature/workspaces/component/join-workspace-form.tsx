"use client"
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useJoinWorkspace } from "../api/use-join-workspace"
import { UseWorkspaceId } from "../hooks/use-workspace-id"
import { useWorkSpaceUrl } from "../hooks/use-workspace-url"


interface JoinWorkspaceSpaceProps {
    initialValues: {
        name: string;
    }
};

export const UseJoinWorkspaceForm =
    ({ initialValues }:
        JoinWorkspaceSpaceProps) => {
        const router = useRouter();
        const { mutate, isPending } = useJoinWorkspace();
        const workspaceId = UseWorkspaceId();
        const workspaceUrl = useWorkSpaceUrl();

        const onSubmit = () => {
            console.log("🚀 Joining with:", {
                workspaceId,
                workspaceUrl,
                workspaceIdType: typeof workspaceId,
                workspaceUrlType: typeof workspaceUrl
            });

            mutate({
                param: { workspaceId },
                json: { workspaceUrl: workspaceUrl }
            }, {
                onSuccess: ({ data }) => {
                    console.log(" Join successful:", data);
                    router.push(`/workspaces/${data.$id}`);
                },
                onError: (error: Error) => {
                    console.error(" Join failed:", {
                        message: error.message,
                        name: error.name,
                        stack: error.stack
                    });
                }
            });
        }


        return (
            <Card className="w-full h-full shadow-none border-none">
                <CardContent className="p-7">
                    <CardTitle className="font-bold text-xl ">
                        Join Workspace
                    </CardTitle>
                    <CardDescription>
                        You&apos;ve been invited to join <strong>{initialValues.name}</strong> workspace
                    </CardDescription>
                </CardContent>
                <div className="px-7">
                    <DottedSeperator />
                </div>
                <CardContent className="p-7">
                    <div className=" flex flex-col items-center gap-2 lg:flex-row justify-between">
                        <Button
                            variant="secondary"
                            type="button"
                            size="lg"
                            disabled={isPending}
                            asChild
                            className="w-full lg:w-fit ">
                            <Link href="/">
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            variant="primary"
                            type="button"
                            onClick={onSubmit}
                            disabled={isPending}
                            size="lg"
                            className="w-full lg:w-fit ">

                            Join Workspace
                        </Button>
                    </div>
                </CardContent>

            </Card>
        )
    }