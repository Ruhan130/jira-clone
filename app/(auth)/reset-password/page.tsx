
"use client";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/app/feature/auth/component/reset-form";

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const secret = searchParams.get("secret") || "";

  return <ResetPasswordForm userId={userId} secret={secret} />;
};

export default ResetPassword;
