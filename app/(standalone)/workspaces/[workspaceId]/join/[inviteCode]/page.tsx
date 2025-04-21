import { getCurrent } from "@/app/feature/auth/queries"
import { UseJoinWorkspaceForm } from "@/app/feature/workspaces/component/join-workspace-form";
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

    const initialValues = await getWorkspaceInfo({
        workspaceId: params.workspaceId
    });

    if (!initialValues) {
        redirect("/");
    }

    return (
        <div className="w-full lg:max-w-xl">
            <UseJoinWorkspaceForm initialValues={initialValues} />
        </div>
    )
}

export default WorkSpaceJoinPage