import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";
import { ProjectIdPage } from "./client";


const ProjectId = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    return <ProjectIdPage />
}

export default ProjectId;