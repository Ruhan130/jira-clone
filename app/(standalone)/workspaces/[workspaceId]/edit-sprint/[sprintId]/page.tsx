export const dynamic = 'force-dynamic';

import { useCurrent } from "@/app/feature/auth/api/use-current"
import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";
import { EditsprintIdClient } from "./client";

const EditSprint = () => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");

    return <EditsprintIdClient  />
}

export default EditSprint 