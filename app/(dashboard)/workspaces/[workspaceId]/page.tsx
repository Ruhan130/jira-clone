import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";

const WorkspaceIdPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    return (
        <div className="">
            abcs
        </div>
        // <div className="">Workspace id: {params.workspaceId}</div>
    )
}
export default WorkspaceIdPage;