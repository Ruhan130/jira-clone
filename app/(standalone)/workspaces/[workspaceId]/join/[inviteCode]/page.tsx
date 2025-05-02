import { getCurrent } from "@/app/feature/auth/queries"
import { redirect } from "next/navigation";
import { WorkspaceJoinIdClient } from "./client";

const WorkSpaceJoinPage = async () => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");

    return <WorkspaceJoinIdClient />
}

export default WorkSpaceJoinPage