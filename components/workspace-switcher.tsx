"use client"
import { RiAddCircleFill } from "react-icons/ri";

import { useGetWorkpsace } from "@/app/feature/workspaces/api/use-get-workspace"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const WorkspaceSwitcher = () => {
  const { data: workspace } = useGetWorkpsace();
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">
          Workspaces
        </p>
        <RiAddCircleFill className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
      </div>
    </div>
  )
}

