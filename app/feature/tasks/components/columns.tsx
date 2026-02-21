"use client";

import { Button } from "@/components/ui/button";
import { Task, TaskTable, TaskType } from "../types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVerticalIcon } from "lucide-react"
import { ProjectAvatar } from "../../projects/component/create-project-avatar";
import { MemberAvatar } from "../../members/component/member-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskActions } from "./task-actions";

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Task Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const name = row.original.name;
            return <p className="line-clamp-1" >{name}</p>
        }
    },

    {
        accessorKey: "project",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Project
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const project = row.original.project;
            console.log(" project data:", project?.imageUrl);
            return (
                <div className="flex items-center text-sm gap-x-2 from-medium">
                    <ProjectAvatar
                        className="size-6"
                        image={project?.imageUrl}
                        name={project?.name || ""}
                    />
                    <p className="line-clamp-1">{project?.name}</p>
                </div>
            )
        }
    },

    {
        accessorKey: "assignee",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Assignee
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const task = row.original;

            // Debug ke liye - console mein check karo
            console.log("Complete task data:", task);
            console.log("Assignee object:", task.assignee);
            console.log("Profile image:", task.assignee?.profileImage);
            console.log("Assignee name:", task.assigneeName);

            // Multiple fallback options
            const profileImage = task.assignee?.profileImage || task.assigneeProfileImage;
            const name = task.assignee?.name || task.assigneeName;

            return (
                <div className="flex items-center text-sm gap-x-2 from-medium">
                    <MemberAvatar
                        className="size-6"
                        image={profileImage}
                        name={name || "Unknown"}
                    />
                    <p className="line-clamp-1">{name || "Unassigned"}</p>
                </div>
            )
        }
    }
    ,
    {
        accessorKey: "dueDate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    DueDate
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const dueDate = row.original.dueDate;
            return <TaskDate value={dueDate} />
        }
    },

    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.original.status;
            return <Badge variant={status as "destructive" | "outline" | "secondary" | "default" | TaskType | null | undefined}>
                {snakeCaseToTitleCase(status)}
            </Badge>
        },



    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.$id;
            const projectId = row.original.projectId;
            return (
                <TaskActions id={id} projectId={projectId}>
                    <Button variant="ghost" className="size-8 p-0">
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </TaskActions>
            )
        }
    }

]