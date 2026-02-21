// File path: app/workspaces/[workspaceId]/create-new-project/page.tsx

"use client";

import { CreateProjectForm } from "@/app/feature/projects/component/create-project-form";
import { useGetMembers } from "@/app/feature/members/api/use-get-members";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";

export default function CreateNewProjectPage() {
    const workspaceId = UseWorkspaceId();
    const router = useRouter();
    const { data: members } = useGetMembers({ workspaceId });

    const memberOptions = members?.documents.map((member) => ({
        id: member.$id,
        name: member.name,
    })) || [];

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="container mx-auto py-8">
                <div className="max-w-2xl mx-auto">
                    <CreateProjectForm
                        onCancel={handleCancel}
                        memberOptions={memberOptions}
                    />
                </div>
            </div>
        </div>
    );
}