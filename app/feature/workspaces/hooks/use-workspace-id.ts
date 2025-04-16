import { useParams } from "next/navigation"

export const UseWorkspaceId = () => {
    const param = useParams();
    return param.workspaceId as string;
};