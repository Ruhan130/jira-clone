import { useParams } from "next/navigation"

export const UseInviteCode = () => {
    const param = useParams();
    return param.inviteCode as string;
};

