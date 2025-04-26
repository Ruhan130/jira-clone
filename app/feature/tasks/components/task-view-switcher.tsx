import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon } from "lucide-react"

export const TaskViewSwitcher = () => {
    return <Tabs className="flex-1 w-full border rounded-lg mt-4">
        <div className="h-full flex flex-col overflow-auto p-4">
            <div className="flex flex-col gap-y-2 lg:flex-row justify-between">
                <TabsList className="w-full lg:w-auto">
                    <TabsTrigger value="table" className="h-8 w-full lg:w-auto">
                        Table
                    </TabsTrigger>
                    <TabsTrigger value="kanban" className="h-8 w-full lg:w-auto">
                        kaban
                    </TabsTrigger>
                    <TabsTrigger value="calender" className="h-8 w-full lg:w-auto">
                        Calender
                    </TabsTrigger>
                </TabsList>
                <Button className="w-full lg:w-auto" size="sm" variant="primary">
                    <PlusIcon className="size-4 mr-2" />
                    New
                </Button>
                <DottedSeperator className="my-4" />
                DATA FILTER
                <DottedSeperator className="my-4" />
                <TabsContent value="table" className="my-0">
                    Table
                </TabsContent>
                <TabsContent value="kanban" className="my-0">
                    kanban
                </TabsContent>
                <TabsContent value="calender" className="my-0">
                    calender
                </TabsContent>

            </div>
        </div>
    </Tabs>
}