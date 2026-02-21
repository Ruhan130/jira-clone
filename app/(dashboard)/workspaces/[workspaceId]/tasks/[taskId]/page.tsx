export const dynamic = 'force-dynamic';

import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";
import { TaskIdClient } from "./client";

const TaskId = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    return <TaskIdClient />
}

export default TaskId;