"use client";

import { Button } from "@/components/ui/button";
import { Task } from "../types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react"

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    }
]