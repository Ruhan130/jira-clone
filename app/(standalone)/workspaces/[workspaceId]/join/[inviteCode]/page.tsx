import { getCurrent } from "@/app/feature/auth/queries"
import { getWorkspaceInfo } from "@/app/feature/workspaces/queries";
import { redirect } from "next/navigation";



interface WorkspaceJoinPageProps {
    params: {
        workspaceId: string;
    }
}

const WorkSpaceJoinPage = async ({
    params,
}: WorkspaceJoinPageProps) => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");
    
    const workspace = await getWorkspaceInfo({
        workspaceId : params.workspaceId
    });
    return (
        <div>
            {JSON.stringify(workspace)};
        </div>
    )
}

export default WorkSpaceJoinPage