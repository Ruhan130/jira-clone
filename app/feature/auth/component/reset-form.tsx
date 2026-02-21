"use client"
import React from "react";
import { useForm } from "react-hook-form";
import { useResetPassword } from "../api/use-reset-password";
import { z } from "zod";
import { resetPasswordSchema } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

type ResetPasswordFormProps = {
  userId: string;
  secret: string;
};

export const ResetPasswordForm = ({ userId, secret }: ResetPasswordFormProps) => {
  const { mutate } = useResetPassword();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      userId,
      secret,
    },
  });

  const { handleSubmit, control } = form;

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    mutate(values); // confirmPassword not needed anymore
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          <span className="text-sm text-gray-500">
            Enter a new password to reset your account.
          </span>
        </CardDescription>
      </CardHeader>
      <div className="px-7 mb-2">
        <DottedSeperator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="password" control={control} render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter new password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button className="w-full" variant="primary" type="submit">
              Reset Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
