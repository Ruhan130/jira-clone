"use client"
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";

import { registerSchema } from "../schemas";
import { useRegister } from "../api/use-register";
// import { register } from "module";




export const SignUpCard = () => {
    const { mutate, isPending } = useRegister();
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    });

    // const { isValid } = form.formState;


    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        const result = registerSchema.safeParse(values);

        if (!result.success) return;

        mutate(
            { json: values },
            {
                onError: (error) => {
                    // Show it on the email field
                    form.setError("email", {
                        type: "manual",
                        message: error.message,
                    });
                },
            }
        );
    };

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl ">
                    Sign Up
                </CardTitle>
                <CardDescription>
                    <span className="text-sm text-gray-500">
                        By signing up, you agree to our {""} <Link className="text-blue-700" href={"/privay"} > Privacy Policy </Link> and {""}<Link href={""} className="text-blue-700"> Terms of service </Link>
                    </span>
                </CardDescription>
            </CardHeader>
            <div className="px-7 mb-2">
                <DottedSeperator />
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField name="name" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Enter your Name"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter your Email"

                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        placeholder="Enter your Password"

                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />

                        <Button
                            className="w-full"
                            variant="primary"
                            type="submit"
                            disabled={isPending}
                        >
                            Sign Up
                        </Button>

                    </form>
                </Form>
            </CardContent>
            <div className="px-7">
                <DottedSeperator />
            </div>
            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button
                    disabled={isPending}
                    size="lg"
                    className="w-full"
                    variant="secondary">
                    <FcGoogle className="mr-5 size-10" />
                    Login with Google
                </Button>

                <Button
                    disabled={isPending}
                    size="lg"
                    className="w-full"
                    variant="secondary">
                    <FaGithub className="mr-5 size-10" />
                    Login with GitHub
                </Button>
            </CardContent>

            <div className="p-7">
                <DottedSeperator />
            </div>

            <CardContent className="px-7 flex items-center justify-center text-center">
                <p>
                    Already have an account? {""}
                    <Link href={"/sign-in"} className="text-blue-700 hover:underline">
                        Sign In
                    </Link>
                </p>
            </CardContent>

        </Card>
    );
};