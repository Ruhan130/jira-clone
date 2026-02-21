export const dynamic = 'force-dynamic';

import { getCurrent } from "@/app/feature/auth/queries";
import MemberList from "@/app/feature/workspaces/component/member-list";
import { redirect } from "next/navigation";


const WorkspaceIdMembersPage = () => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");

    return (
        <div className="w-full lg:max-w-xl">
            <MemberList />
        </div>
    );
}

export default WorkspaceIdMembersPage;