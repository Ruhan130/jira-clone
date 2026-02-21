export const dynamic = 'force-dynamic';
import MyraWelcome from "@/app/feature/auth/component/welcome-board";
import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";

const WelcomeBoard = () => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");

    return (
        <MyraWelcome />
    )
}
export default WelcomeBoard