import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useResetPassword } from "../api/use-reset-password";
import { z } from "zod";
import { resetPasswordSchema } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";

type ResetPasswordFormProps = {
  userId: string;
  secret: string;
};

const ResetPasswordForm = ({ userId, secret }: ResetPasswordFormProps) => {
  const { mutate } = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });
  
  const [newPassword, setNewPassword] = useState<string>("");

  const onSubmit = async (values: { password: string }) => {
    try {
      await mutate({ userId, secret, password: values.password });
    } catch (error) {
      console.error("Failed to reset password:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="password">New Password</label>
        <input
          type="password"
          id="password"
          {...register("password")}
          placeholder="Enter your new password"
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit">Reset Password</button>
    </form>
  );
};

export default ResetPasswordForm;
