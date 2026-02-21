import { useParams } from "next/navigation";

export const UseSprintId = () => {
    const param = useParams();
    return param.sprintId as string;
};