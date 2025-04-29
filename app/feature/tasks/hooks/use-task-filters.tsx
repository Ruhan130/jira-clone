import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { TaskType } from "../types";

export const useTaskFilter = () => {
    return useQueryStates(
        {
            projectId: parseAsString,
            status: parseAsStringEnum(Object.values(TaskType)),
            assigneeId: parseAsString,
            search: parseAsString,
            dueDate: parseAsString
        }
    )
}