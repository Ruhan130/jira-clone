"use client"
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "../schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "../api/use-forget-password";

export const ForgetTesting = () => {
    const forgetPassword = useForgotPassword();
    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: ""
        }
    });
    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl ">
                    Forgot Password
                </CardTitle>
                <CardDescription>
                    <span className="text-sm text-gray-500">
                        click here to initiate a password reset through our secure system.
                    </span>
                </CardDescription>
            </CardHeader>
            <div className="px-7 mb-2">
                <DottedSeperator />
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((data) => {
                            forgetPassword.mutate({ json: data });
                        })} className="space-y-4">
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
                        <Button
                            className="w-full"
                            variant="primary"
                            type="submit"
                            disabled={forgetPassword.isPending}
                        >
                            Forgot Password
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}