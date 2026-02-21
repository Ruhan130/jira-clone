
export const dynamic = 'force-dynamic';
import { getCurrent } from "@/app/feature/auth/queries";
import { ShowBacklogTask } from "@/app/feature/sprint/component/show-backlog-tasks";
import { useGetTasks } from "@/app/feature/tasks/api/use-get-tasks";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { redirect } from "next/navigation";
import { BackLogTasksIdClient } from "./client";

const BackLogTasks = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    return <BackLogTasksIdClient />
}

export default BackLogTasks;