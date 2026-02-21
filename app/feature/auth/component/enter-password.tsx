"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MdPassword } from "react-icons/md";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useLogin } from "../api/use-login";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";


const formSchema = z.object({
    password: z.string().min(1, "Password is required")
});

type FormSchema = z.infer<typeof formSchema>;

export const EnterPasswordForm = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const inviteToken = searchParams.get("invite");

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: ""
        }
    });
    const loginMutation = useLogin({ inviteToken: inviteToken || undefined });
    const router = useRouter();

    const onSubmit = (values: FormSchema) => {
        if (!email) {
            return toast.error("Email missing from URL parameters");
        }

        loginMutation.mutate({
            json: {
                email,
                password: values.password
            }
        });
    };

    return (
        <Card className="w-full max-w-md mx-auto bg-slate-900 p-6 sm:p-8 md:p-10 text-white rounded-md border-none">
            <CardHeader className="px-0">
                <CardTitle className="text-2xl sm:text-3xl font-bold tracking-wide">
                    Step into a smarter way to work
                </CardTitle>
            </CardHeader>

            <CardContent className="px-0">
                <p className="text-gray-400 text-xs sm:text-sm mb-6">
                    All your blueprints. One smart space.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <label className="text-xs sm:text-sm mb-1 block">Password</label>
                                    <FormControl>
                                        <div className="relative">
                                            <MdPassword className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Enter Your Password"
                                                className="w-full pl-10 bg-transparent text-gray-400 text-sm border-0 border-b border-white rounded-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-white"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 mt-4 border-0 disabled:opacity-50"
                        >
                            {loginMutation.isPending ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </Form>

                <p className="text-xs text-center text-gray-400 mt-6">
                    By logging into an account, you agree to our{" "}
                    <span className="underline cursor-pointer">terms of service</span> and{" "}
                    <span className="underline cursor-pointer">privacy policy</span>.
                </p>

                <div className="flex justify-end mt-8">
                    <Link href="/forget-password" className="text-white text-sm underline font-normal">
                        Forgot-Password?
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};
