import { getCurrent } from "@/app/feature/auth/queries";
import { ProjectAvatar } from "@/app/feature/projects/component/create-project-avatar";
import { getProject } from "@/app/feature/projects/queries";
import { TaskViewSwitcher } from "@/app/feature/tasks/components/task-view-switcher";
// import TaskViewSwitcher from "@/app/feature/tasks/components/task-view-switcher";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectIdClient } from "./client";

const ProjectIdPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");


    return <ProjectIdClient />
}

export default ProjectIdPage;