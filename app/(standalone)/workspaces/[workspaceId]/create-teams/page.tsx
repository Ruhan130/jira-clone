"use client";


import { useGetMembers } from "@/app/feature/members/api/use-get-members";
import { useGetAllMembers } from "@/app/feature/members/api/use-get-members-without-id";
import { Member, MemberType } from "@/app/feature/members/type";
import { CreateTeamForm } from "@/app/feature/teams/components/create-teams-form";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { PageLoader } from "@/components/page-loader";


const MembersDebugPage = () => {
  const workspaceId = UseWorkspaceId();
  const { data, isLoading } = useGetMembers({ workspaceId });

  console.log("Full API Response:", data);
  console.log("Members documents:", data?.documents);

  if (isLoading) return <PageLoader />;

  const mappedMembers = data?.documents?.map((member: Member) => { 
    return {
      id: member.userId,
      name: member.name || "Unknown",
      image: member.profileImage || undefined,
    };
  }) ?? [];

  console.log("Final mapped members:", mappedMembers);

  return (
    <div className="w-full lg:max-w-xl">
      <CreateTeamForm memberOptions={mappedMembers} workspaceId={workspaceId} />
    </div>
  )
};

export default MembersDebugPage;

