"use client"
import React, { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Users, Plus, Crown, Briefcase, MoreHorizontalIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetTeams } from '../api/use-get-teams';
import { UseWorkspaceId } from '../../workspaces/hooks/use-workspace-id';
import { PageLoader } from '@/components/page-loader';

interface TeamLead {
    id: string;
    name: string;
    image?: string;
}

interface TeamMember {
    id: string;
    name: string;
    image?: string;
}

export const TeamView = () => {
    const router = useRouter();
    const workspaceId = UseWorkspaceId();
    const { data: teamsData, isLoading: teamsDataLoading } = useGetTeams({ workspaceId });

    if (teamsDataLoading) return <PageLoader />

    const handleSearch = () => {
        console.log('Search clicked');
    };

    const handleNewTeam = () => {
        console.log('New team clicked');
    };

    return (
        <div className="w-full max-w-6xl mx-auto bg-gray-50 ">
            {/* Header Section */}
            <div className="flex items-center justify-between p-6 bg-white border-b">
                {/* Left side - Teams title and dropdown */}
                <div className="flex items-center gap-4">
                    {/* Teams Title with Icon */}
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        <h1 className="text-xl font-semibold text-gray-900">Teams</h1>
                    </div>

                    {/* Your teams dropdown */}
                    <Select defaultValue="your-teams">
                        <SelectTrigger className="w-[140px] h-8 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="your-teams">
                                Your teams <span className="ml-1 text-xs text-gray-500">
                                    {teamsData?.documents?.length || 0}
                                </span>
                            </SelectItem>

                            {/* Individual teams */}
                            {teamsData?.documents?.map((team) => (
                                <SelectItem key={team.$id} value={team.$id}>
                                    {team.name}
                                </SelectItem>
                            ))}

                            {/* Other options */}

                        </SelectContent>
                    </Select>
                </div>


                <div className="flex items-center gap-3">

                    {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSearch}
                        className="w-8 h-8 p-0 hover:bg-gray-100"
                    >
                        <Search className="w-4 h-4 text-gray-600" />
                    </Button> */}


                    <Button
                        onClick={() => router.push(`/workspaces/${workspaceId}/create-teams`)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        New Team
                    </Button>
                </div>
            </div>

            {/* Teams List Section */}
            <div className="p-6">
                {teamsDataLoading ? (
                    <div className="text-gray-500">Loading teams...</div>
                ) : (
                    <div className="bg-white rounded-lg border">
                        {teamsData?.documents?.map((team) => {
                            // Parse team lead data
                            let teamLead: TeamLead | null = null;
                            try {
                                teamLead = JSON.parse(team.team_lead || '{}');
                            } catch (error) {
                                console.error('Error parsing team lead:', error);
                            }

                            // Parse members data
                            let members: TeamMember[] = [];
                            try {
                                members = JSON.parse(team.members || '[]');
                            } catch (error) {
                                console.error('Error parsing members:', error);
                            }

                            return (
                                <div key={team.$id} className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                                    {/* Team Image */}
                                    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                                        {team.image ? (
                                            <img
                                                src={team.image}
                                                alt={team.name}
                                                className="w-8 h-8 rounded-md object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium text-gray-600">
                                                {team.name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Team Name */}
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">{team.name}</h3>
                                        {team.description && (
                                            <p className="text-xs text-gray-500 mt-1">{team.description}</p>
                                        )}
                                    </div>

                                    {/* Team Lead */}
                                    <div className="relative flex items-center mr-3">
                                        {/* Team Lead Image */}
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            {teamLead?.image ? (
                                                <img
                                                    src={teamLead.image}
                                                    alt={teamLead.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-blue-600">
                                                    {teamLead?.name?.charAt(0)?.toUpperCase() || 'TL'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Crown Icon */}
                                        <div className="absolute top-[0.5px] -left-3 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                                            <Crown className="w-3 h-4 text-white" />
                                        </div>
                                    </div>

                                    {/* Team Members Stack */}
                                    <div className="flex items-center -space-x-2 mr-3">
                                        {members.slice(0, 4).map((member, index) => (
                                            <div
                                                key={member.id}
                                                className="w-8 h-8 rounded-full bg-pink-300  border border-white flex items-center justify-center"
                                                style={{ zIndex: 10 - index }}
                                            >
                                                {member.image ? (
                                                    <img
                                                        src={member.image}
                                                        alt={member.name}
                                                        className="w-7 h-7 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {member.name?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        ))}

                                        {/* Show +X if more than 4 members */}
                                        {members.length > 4 && (
                                            <div className="w-7 h-7 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                                                <span className="text-xs font-medium text-white">
                                                    +{members.length - 4}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center px-2 py-1 border rounded-md border-neutral-200 gap-2">
                                        <Briefcase className='w-4 h-4 text-neutral-400 ' />
                                        <span className='text-neutral-500 text-xs'>
                                            {
                                                members.length.toString()
                                            }
                                        </span>
                                    </div>

                                    {/* DOTTED LINE */}
                                    <MoreHorizontalIcon className='h-5 text-neutral-400 ml-3' />

                                </div>
                            );
                        })}

                        {teamsData?.documents?.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No teams found. Create your first team!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};