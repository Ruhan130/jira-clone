import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderIcon, UserIcon } from "lucide-react"
import { useTaskFilter } from "../../tasks/hooks/use-task-filters";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { useGetTeams } from "../../teams/api/use-get-teams";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";


export const BacklogViewDataFilter = ({ onApplyFilters }: { onApplyFilters: (teamId: string | null, projectId: string | null) => void }) => {
    const workspaceId = UseWorkspaceId();
    const { data: teams } = useGetTeams({ workspaceId });
    const { data: projects } = useGetProjects({ workspaceId });

    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const optionsTeams = teams?.documents.map((team) => ({
        label: team.name,
        value: team.$id,
    }));

    const filteredProjects = useMemo(() => {
        if (!selectedTeamId) return [];

        const teamProjects = projects?.documents?.filter(project => {
            if (project.teamId === selectedTeamId) return true;
            if (project.members?.includes(`team_${selectedTeamId}`)) return true;
            return false;
        }) || [];

        return teamProjects;
    }, [projects?.documents, selectedTeamId]);

    const optionProjects = filteredProjects.map((project) => ({
        label: project.name,
        value: project.$id,
    }));

    const handleTeamChange = (value: string) => {
        const teamId = value === "all" ? null : value;
        setSelectedTeamId(teamId);
        setSelectedProjectId(null);
        // Clear tasks when team changes
        onApplyFilters(null, null);
    };

    const handleProjectChange = (value: string) => {
        const projectId = value === "all" ? null : value;
        setSelectedProjectId(projectId);

        // 🚀 AUTOMATIC LOADING - No View button needed!
        if (selectedTeamId && projectId) {
            onApplyFilters(selectedTeamId, projectId);
        } else {
            onApplyFilters(null, null);
        }
    };

    // ❌ REMOVED: handleViewClick function
    // ❌ REMOVED: View Button

    return (
        <div className="flex items-center gap-3 py-1">
            <Select value={selectedTeamId || undefined} onValueChange={handleTeamChange}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <UserIcon className="size-8 pr-2" />
                    <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectSeparator />
                    {optionsTeams?.map((team) => (
                        <SelectItem key={team.value} value={team.value}>
                            {team.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={selectedProjectId || undefined}
                onValueChange={handleProjectChange}
                disabled={!selectedTeamId}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <FolderIcon className="size-8 pr-2" />
                    <SelectValue
                        placeholder={
                            !selectedTeamId
                                ? "Select team first"
                                : filteredProjects.length === 0
                                    ? "No projects for this team"
                                    : "Select Project"
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {selectedTeamId && filteredProjects.length > 0 && (
                        <>
                            {optionProjects?.map((project) => (
                                <SelectItem key={project.value} value={project.value}>
                                    {project.label}
                                </SelectItem>
                            ))}
                        </>
                    )}
                    {selectedTeamId && filteredProjects.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            No projects assigned to this team
                        </div>
                    )}
                </SelectContent>
            </Select>

           
        </div>
    );
};