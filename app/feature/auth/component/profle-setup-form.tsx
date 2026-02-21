"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { useRegister } from "../api/use-register";
import { z } from "zod";
import { registerSchema } from "../schemas";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";

export const ProfileSetupForm = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const inviteToken = searchParams.get("invite");
    const isInviteFlow = !!inviteToken;


    const { mutate, isPending } = useRegister();
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: email || "",
            password: "",
            position: "",
            productNotification: false,
            imageUrl: undefined,
        }
    });

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        const result = registerSchema.safeParse(values);
        if (!result.success) return;

        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("position", values.position);
        formData.append("productNotification", values.productNotification.toString());

        if (values.imageUrl && values.imageUrl instanceof File) {
            formData.append("imageUrl", values.imageUrl);
        }

        mutate(formData, {
            onError: (error) => {
                form.setError("email", {
                    type: "manual",
                    message: error.message,
                });
            },
        });
    };

    const inputRef = useRef<HTMLInputElement>(null);

    const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 8_000_000) {
                toast.error("Image size should be less than 8MB");
                return;
            }
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                toast.error("Only PNG and JPEG files are allowed");
                return;
            }

            form.setValue("imageUrl", file);
        }
    };

    const handleImageRemove = () => {
        form.setValue("imageUrl", "");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const selectedImage = form.watch("imageUrl");
    const previewUrl = selectedImage instanceof File ? URL.createObjectURL(selectedImage) : null;

    return (

        <Card className="w-full max-w-[500px] p-8 shadow-xl rounded-xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                    Let's get to know you
                </CardTitle>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2">
                    Behind every great task list is a greater human
                </p>
            </CardHeader>

            <CardContent>
                {/* Profile Image Upload */}

                <div className="mb-6">
                    <Label className="ml-20 text-sm">Profile picture</Label>
                    <div className="flex items-center gap-4 ">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                            {previewUrl ? (
                                <Image
                                    src={previewUrl}
                                    alt="Profile"
                                    width={64}
                                    height={64}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <Camera className="text-white w-6 h-6" />
                            )}
                        </div>

                        {!previewUrl ? (
                            <>
                                <Input
                                    ref={inputRef}
                                    id="profile-image"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={handleImageInput}
                                    className="hidden"
                                />
                                <Label
                                    htmlFor="profile-image"
                                    className="text-sm font-medium border border-gray-300 px-3 py-1.5 rounded-md cursor-pointer hover:text-gray-500"
                                >
                                    Upload image
                                </Label>
                            </>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleImageRemove}
                                className="text-red-500 border-red-300 hover:bg-red-50"
                            >
                                Remove image
                            </Button>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 ml-20">
                        .png, .jpeg files up to 8mb at least 500px by 500px
                    </p>
                </div>

                {/* Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Full name</Label>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your name"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Position</Label>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your position"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Password</Label>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Create a secure password"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DottedSeperator className="pt-3" />

                        {/* Subscribe Switch - ✅ Using form control */}
                        <FormField
                            control={form.control}
                            name="productNotification"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between pt-4">
                                        <div>
                                            <Label>Subscribe to product emails</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Get the latest updates about Myra's new features
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full mt-4"
                            disabled={isPending}
                        >
                            {isPending ? "Creating account..." : "Continue"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

    );
};