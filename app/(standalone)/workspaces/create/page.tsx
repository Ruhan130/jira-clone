export const dynamic = 'force-dynamic';

import { getCurrent } from "@/app/feature/auth/queries";
import { CreateWorkSpaceForm } from "@/app/feature/workspaces/component/create-workspace-form";
import { redirect } from "next/navigation";

const WorkspaceCreatePage = async ({ searchParams }: { searchParams: { mode?: string } }) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    const mode = searchParams.mode === 'dashboard' ? 'dashboard' : 'onboarding';
    return (
        <div className="w-full lg:max-w-xl">
            <CreateWorkSpaceForm mode={mode} />
        </div>
    )
}

export default WorkspaceCreatePage;