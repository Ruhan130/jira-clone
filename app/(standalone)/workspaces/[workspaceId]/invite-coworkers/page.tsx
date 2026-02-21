export const dynamic = 'force-dynamic';

import { InviteTeam } from "@/app/feature/auth/component/invite-workers";
import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";

const InviteCowokrers = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    return (
        <InviteTeam />
    )
}

export default InviteCowokrers