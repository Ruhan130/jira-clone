import { getCurrent } from "@/app/feature/auth/actions";

import { redirect } from "next/navigation";

interface WorkspaceSettingPageProps {
    params: {
        workspaceId: string;
    }
}

const WorkspaceSettingPage = async ({ params }: WorkspaceSettingPageProps) => {

    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    return (
        <div>
            DATABASE UPDATE PAGE : {params.workspaceId}
        </div>
    )
}

export default WorkspaceSettingPage