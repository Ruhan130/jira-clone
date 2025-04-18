import { getCurrent } from "@/app/feature/auth/queries";
import { getWorkspace } from "@/app/feature/workspaces/queries";
import { EditWorkSpaceForm } from "@/app/feature/workspaces/component/edit-workspace-form";

import { redirect } from "next/navigation";

interface WorkspaceSettingPageProps {
    params: {
        workspaceId: string;
    }
}

const WorkspaceSettingPage = async ({ params }: WorkspaceSettingPageProps) => {

    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    const initialValues = await getWorkspace({ workspaceId: params.workspaceId });
    if (!initialValues) {
        redirect(`/workspaces/${params.workspaceId}`)
    }
    return (
        <div className="w-full lg:max-w-xl">
            <EditWorkSpaceForm initialValues={initialValues} />
        </div>
    )
}

export default WorkspaceSettingPage