import { projectAnalyticsResponseType } from "@/app/feature/projects/api/use-get-project-analytics"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { AnalyticsCard } from "./analytics-card"
import { DottedSeperator } from "./dotted-seperater.tsx/dotted-seperater"

export const Analytics = ({ data }: projectAnalyticsResponseType) => {
    return (
        <ScrollArea className=" border rounded-lg w-full whitespace-nowrap shrink-0">
            <div className="w-full flex flex-row">
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Total Task"
                        value={data.taskCount}
                        varient={data.taskDifference > 0 ? "up" : "down"}
                        increaseValue={data.taskDifference}
                    />
                    <DottedSeperator direction="vertical" />
                </div>


                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Completed Task"
                        value={data.completedTaskCount}
                        varient={data.completedTaskDifference > 0 ? "up" : "down"}
                        increaseValue={data.completedTaskDifference}
                    />
                    <DottedSeperator direction="vertical" />
                </div>

                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Overdue Task"
                        value={data.overDueTaskCount}
                        varient={data.overDueTaskDifference > 0 ? "up" : "down"}
                        increaseValue={data.overDueTaskDifference}
                    />
                    <DottedSeperator direction="vertical" />
                </div>

                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Incomplete Task"
                        value={data.incompleteTasksCount}
                        varient={data.incompleteTaskDifference > 0 ? "up" : "down"}
                        increaseValue={data.incompleteTaskDifference}
                    />
                    <DottedSeperator direction="vertical" />
                </div>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}