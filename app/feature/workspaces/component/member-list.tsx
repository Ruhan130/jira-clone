"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseWorkspaceId } from "../hooks/use-workspace-id"
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { useGetMember } from "@/app/feature/members/api/use-get-members";
import { Fragment } from "react";
import { MemberAvatar } from "../../members/component/member-avatar";

const MemberList = () => {
    const workspaceId = UseWorkspaceId();
    const { data } = useGetMember({ workspaceId });
    return (
        <Card className="w-full h-full border-none shadow-none">
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
                        </div>
                    </Fragment>
                ))}
            </CardContent>
        </Card>
    );
}

export default MemberList;