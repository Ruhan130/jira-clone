import { getCurrent } from "@/app/feature/auth/actions";
import { CreateWorkSpaceForm } from "@/app/feature/workspaces/component/create-workspace-form";
import { redirect } from "next/navigation";

const WorkspaceCreatePage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    return (
        <div className="w-full lg:max-w-xl">
            <CreateWorkSpaceForm />
        </div>
    )
}

export default WorkspaceCreatePage;