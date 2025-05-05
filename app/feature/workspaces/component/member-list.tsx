"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseWorkspaceId } from "../hooks/use-workspace-id"
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { useGetMembers } from "@/app/feature/members/api/use-get-members";
import { Fragment } from "react";
import { MemberAvatar } from "../../members/component/member-avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useDeleteMembers } from "../../members/api/use-delete-member";
import { useUpdateMember } from "../../members/api/use-update-member";
import { MemberType } from "../../members/type";
import { useConform } from "@/hooks/use-confirm";

const MemberList = () => {
    const workspaceId = UseWorkspaceId();

    const [ConfirmDailogue, confirm] = useConform(
        "remove member",
        "This will be removed from the worksppace",
        "destructive"
    )

    const { data } = useGetMembers({ workspaceId });

    const {
        mutate: deleteMember,
        isPending: isDeleteMemberPending
    } = useDeleteMembers();

    const {
        mutate: updateMember,
        isPending: isPendingUpdateMember
    } = useUpdateMember();

    const handleUpdateMember = (memberId: string, role: MemberType) => {
        updateMember({
            json: { role },
            param: { memberId }
        })
    }

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirm();
        if (!ok) return;
        deleteMember({
            param: { memberId }
        }, {
            onSuccess: () => {
                window.location.reload();
            }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <ConfirmDailogue />
            <CardHeader className="flex flex-row items-center gap-x-4 py-7 space-y-0 ">
                <Button variant="secondary" asChild size="sm">
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <CardTitle className="text-xl font-bold">
                    Member List
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeperator />
            </div>
            <CardContent className="p-7">
                {data?.documents.map((member, index) => (
                    <Fragment key={member.$id}>
                        <div className="flex items-center gap-2">
                            <MemberAvatar
                                className="size-10"
                                name={member.name}
                                FallbackClassName="text-lg"
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="ml-auto"
                                        size="icon"
                                        variant="secondary"
                                    >
                                        <MoreVerticalIcon className="size-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    side="bottom"
                                    className="w-52  p-2 shadow-lg border rounded-xl"
                                >
                                    <DropdownMenuItem
                                        className="font-medium gap-3 text-xs hover:bg-muted cursor-pointer"
                                        onClick={() => handleUpdateMember(member.$id, MemberType.ADMIN)}
                                        disabled={isPendingUpdateMember}
                                    >
                                        🛡️ Set as administrator
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        className="font-medium gap-3 text-xs hover:bg-muted cursor-pointer"
                                        onClick={() => handleUpdateMember(member.$id, MemberType.MEMBER)}
                                        disabled={isPendingUpdateMember}
                                    >
                                        👤 Set as member
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        className="font-medium text-amber-700 gap-3 text-xs hover:bg-destructive/10 cursor-pointer"
                                        onClick={() => handleDeleteMember(member.$id)}
                                        disabled={isDeleteMemberPending}
                                    >
                                        ❌ Remove {member.name}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>
                        {index < data?.documents.length - 1 && (
                            <Separator className="my-2.5" />
                        )}
                    </Fragment>
                ))}
            </CardContent>
        </Card>
    );
}

export default MemberList;