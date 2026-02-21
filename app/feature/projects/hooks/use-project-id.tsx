import { useParams } from "next/navigation"

export const useProjectId = () => {
    const param = useParams();
    return param.projectId as string;
}