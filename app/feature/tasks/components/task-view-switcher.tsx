"use client";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon } from "lucide-react"
import { UseCreateProjectModal } from "../../projects/hooks/use-create-project-modal"
import { UseCreateTaskModal } from "../hooks/use-create-task-modal";

export const TaskViewSwitcher = () => {
    const { open, setIsOpen } = UseCreateTaskModal();

    return (
        <Tabs className="flex-1 w-full border rounded-lg">
            <div className="h-full flex flex-col overflow-auto p-4">
                <div className="flex flex-col gap-y-2 lg:flex-row  justify-between items-center">
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
                    <Button
                        onClick={open}
                        className="w-full lg:w-auto"
                        size="sm">
                        <PlusIcon className="size-4 mr-2" />
                        New
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                DATA FILTER
                <DottedSeperator className="my-4" />
                <TabsContent value="table" className="mt-0">
                    Table
                </TabsContent>
                <TabsContent value="kanban" className="mt-0">
                    kanban
                </TabsContent>
                <TabsContent value="calender" className="mt-0">
                    calender
                </TabsContent>

            </div>
        </Tabs>
    )
}