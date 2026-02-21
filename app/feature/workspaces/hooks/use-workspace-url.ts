import { useParams } from "next/navigation";

export const useWorkSpaceUrl = () => {
    const param = useParams();
    return param.inviteCode as string;

}