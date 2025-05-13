
import { ResetPasswordForm } from "@/app/feature/auth/component/reset-form";
import { getCurrent } from "@/app/feature/auth/queries"
import { redirect, useSearchParams } from "next/navigation";
// import { useSearchParams } from "next/navigation";

const ResetPassword = async () => {
    const account = await getCurrent();
  
    if (account) redirect("/")

    return (
        <ResetPasswordForm userId="" secret="" />
    )
}

export default ResetPassword