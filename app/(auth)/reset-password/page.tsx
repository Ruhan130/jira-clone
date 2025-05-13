import { getCurrent } from "@/app/feature/auth/queries"
import { redirect } from "next/navigation";

const ResetPassword = async () => {
    const account = await getCurrent();
   if(account) redirect("/")

    return (
        <div className="">
            Forget Passowrd

        </div>
    )
}

export default ResetPassword