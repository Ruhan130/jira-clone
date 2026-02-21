export const dynamic = 'force-dynamic';

import { getCurrent } from "@/app/feature/auth/queries";
import { TeamView } from "@/app/feature/teams/components/view-teams";
import { redirect } from "next/navigation";

const ViewTeamsPage = () => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");
    return <TeamView />;
}
export default ViewTeamsPage;