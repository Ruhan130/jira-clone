"use client"
import { useGetProjects } from "@/app/feature/projects/api/use-get-projects";
import { ProjectAvatar } from "@/app/feature/projects/component/create-project-avatar";
import { UseCreateProjectModal } from "@/app/feature/projects/hooks/use-create-project-modal";
// import { useGetWorkpsaces } from "@/app/feature/workspaces/api/use-get-workspaces";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

const Projects = () => {
    // const projectId = null;
    const pathname = usePathname();
    const { open } = UseCreateProjectModal();
    const workspaceId = UseWorkspaceId();
    const { data } = useGetProjects({ workspaceId });
    const router = useRouter();

    const handleAddProject = () => {
        router.push(`/workspaces/${workspaceId}/create-new-project`);
    };

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-neutral-500">
                    Projects
                </p>
                 <RiAddCircleFill 
                    onClick={handleAddProject} 
                    className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" 
                />
            </div>
            {
                data?.documents.map((project) => {
                    const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
                    const isActive = pathname === href;
                    return (
                        <Link href={href} key={project.$id}>
                            <div className={cn("flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500", isActive && "bg-white shadow-sm hover:opacity-100 text-primary")}>
                                <ProjectAvatar image={project.imageUrl} name={project.name} />
                                <span className="truncate" >{project.name}</span>
                            </div>
                        </Link>
                    );
                })
            }
        </div>
    );
}

export default Projects;