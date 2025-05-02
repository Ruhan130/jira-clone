"use client"
import { RiAddCircleFill } from "react-icons/ri";

import { useGetWorkpsaces } from "@/app/feature/workspaces/api/use-get-workspaces"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkspaceAvatar } from "@/app/feature/workspaces/component/create-workspace-avatar";
import { useRouter } from "next/navigation";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { UseCreateWorkspaceModal } from "@/app/feature/workspaces/hooks/use-create-workspace-modal";

export const WorkspaceSwitcher = () => {
  const workspaceId = UseWorkspaceId();
  const router = useRouter();
  const { data: workspaces } = useGetWorkpsaces();

  const { open } = UseCreateWorkspaceModal();
  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  }
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">
          Workspaces
        </p>
        <RiAddCircleFill onClick={open} className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
      </div>
      <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="w-full font-medium p-1 bg-neutral-200">
          <SelectValue placeholder="No workspace Selected" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.documents.map((workspaces) => (
            <SelectItem key={workspaces.$id} value={workspaces.$id}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar name={workspaces.name} image={workspaces.imageUrl} />
                <span className="truncate">{workspaces.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

