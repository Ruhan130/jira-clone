export const dynamic = 'force-dynamic';

import { ProfileSetupForm } from "@/app/feature/auth/component/profle-setup-form";
import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";

const ProfileSetup = async () => {
    const account = await getCurrent();
    if (account) redirect("/")
    return (
        <ProfileSetupForm />
    )
}

export default ProfileSetup