export const dynamic = 'force-dynamic';

import { getCurrent } from "@/app/feature/auth/queries";
import { MyTaskViewSwitcher } from "@/app/feature/tasks/components/my-task-view-switcher";
import { TaskViewSwitcher } from "@/app/feature/tasks/components/task-view-switcher";
import { redirect } from "next/navigation";


const TaskPage = async () => {
    const user = await getCurrent();
    if (!user) {
        redirect("/sign-in");
    }
    return (
        <div className="flex flex-col h-full">
            <MyTaskViewSwitcher   />
        </div>
    );
}

export default TaskPage;