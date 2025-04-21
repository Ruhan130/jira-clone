import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";

const WorkspaceIdPage = async ({ params }) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    return (
        <div className="">Workspace id: {params.workspaceId}</div>
    )
}
export default WorkspaceIdPage;