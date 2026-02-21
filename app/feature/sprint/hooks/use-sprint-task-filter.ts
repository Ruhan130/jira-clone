import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import { SprintSectionTaskType } from "../type"

export const useTaskFilter = () => {
    return useQueryStates(
        {
            projectId: parseAsString,
            status: parseAsStringEnum(Object.values(SprintSectionTaskType)),
            assigneeId: parseAsString,
            search: parseAsString,
            dueDate: parseAsString,
            sprintId: parseAsString
        }
    )
} 