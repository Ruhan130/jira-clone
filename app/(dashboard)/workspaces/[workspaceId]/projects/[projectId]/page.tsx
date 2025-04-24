import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";

interface ProjectIdpAgeProps {
    params: { projectId: string }
}
const ProjectIdPage = async ({ params }: ProjectIdpAgeProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    return (
        <div className="">
            PRoject Id Page : ${params.projectId}
        </div>
    );
}

export default ProjectIdPage;