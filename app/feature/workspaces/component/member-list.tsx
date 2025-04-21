"use client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { UseWorkspaceId } from "../hooks/use-workspace-id"
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { useGetMember } from "@/app/feature/members/api/use-get-members";

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
        </Card>
    );
}

export default MemberList;