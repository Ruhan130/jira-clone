import { projectAnalyticsResponseType } from "@/app/feature/projects/api/use-get-project-analytics"
import { ScrollArea } from "./ui/scroll-area"

export const Analytics = ({ data }: projectAnalyticsResponseType) => {
    return (
        <ScrollArea className=" border rounded-lg w-full whitespace-nowrap shrink-0">
             
        </ScrollArea>
    )
}