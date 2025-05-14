import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";
import { ProjectIdClient } from "./client";

const ProjectIdPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");


    return <ProjectIdClient />
}

export default ProjectIdPage;