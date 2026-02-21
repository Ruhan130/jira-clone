"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVerifyCode } from "../api/use-verfiy-code";
import { useSendVerificationCode } from "../api/use-send-magic-link";

const schema = z.object({
    code: z.string()
        .min(8, "Code must be 8 digits")
        .max(8, "Code must be 8 digits")
        .regex(/^\d+$/, "Code must contain only numbers")
});

export const VerifyCodeComponent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email");

    const verifyCodeMutation = useVerifyCode();
    const resendCodeMutation = useSendVerificationCode();

    const form = useForm<{ code: string }>({
        resolver: zodResolver(schema),
        defaultValues: { code: "" }
    });


    const onSubmit = async ({ code }: { code: string }) => {
        if (!email) {
            return;
        }
        try {
            const trimmedCode = code.trim();
            await verifyCodeMutation.mutateAsync({ email, code: trimmedCode });

            const inviteToken = searchParams.get("invite")
            const profileSetupUrl = inviteToken
                ? `/profile-setup?email=${encodeURIComponent(email)}&invite=${inviteToken}`
                : `/profile-setup?email=${encodeURIComponent(email)}`;
            router.replace(profileSetupUrl);
        } catch (error) {
            console.error("Code verification failed:", error);
        }
    };
    const handleResendCode = async () => {
        if (!email) return;

        try {
            await resendCodeMutation.mutateAsync({ email });
        } catch (error) {
            console.error("Resend code failed:", error);
        }
    };

    const getMaskedEmail = (email: string | null): string => {
        if (!email) return "a******@gmail.com";
        const [local, domain] = email.split("@");
        const maskedLocal = local.charAt(0) + "******";
        return `${maskedLocal}@${domain}`;
    };

    const isLoading = verifyCodeMutation.isPending;
    const isResending = resendCodeMutation.isPending;

    return (
        <div className="w-full max-w-md mx-auto bg-slate-900 p-6 sm:p-8 md:p-10 text-white rounded-md border-none">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide mb-4">
                Step into a smarter way to work
            </h1>

            <p className="text-gray-400 text-xs sm:text-sm mb-6">
                All your blueprints. One smart space.
            </p>

            <p className="text-gray-400 text-xs mb-6">
                We've sent you an 8-digit verification code. Please check your inbox at{" "}
                <span className="font-mono text-blue-300">{getMaskedEmail(email)}</span>.{" "}
                Enter the code below:
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="text-xs sm:text-sm mb-2 block">8-Digit Code</label>
                    <input
                        {...form.register("code")}
                        type="text"
                        maxLength={8}
                        disabled={isLoading}
                        placeholder=""
                        className="w-full bg-transparent text-white text-lg text-center py-3 px-4 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 tracking-widest"
                    />
                    {form.formState.errors.code && (
                        <p className="text-red-400 text-xs mt-1">
                            {form.formState.errors.code.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 font-medium"
                >
                    {isLoading ? "Verifying..." : "Verify Code"}
                </button>
            </form>

            {/* Resend code */}
            <div className="text-center mt-6">
                <p className="text-gray-400 text-sm mb-2">
                    Didn't receive the code?
                </p>
                <button
                    onClick={handleResendCode}
                    disabled={isResending || isLoading}
                    className="text-blue-400 hover:text-blue-300 text-sm underline disabled:opacity-50"
                >
                    {isResending ? "Sending..." : "Resend code"}
                </button>
            </div>

            {/* Back to login */}
            <button
                onClick={() => router.push("/sign-in")}
                disabled={isLoading}
                className="w-full bg-transparent text-gray-400 hover:text-white py-2 px-4 rounded-md hover:bg-blue-800 transition duration-300 mt-4 border border-gray-600"
            >
                Back to login
            </button>

            {/* Help text */}
            <p className="text-gray-500 text-xs text-center mt-4">
                The verification code will expire in 15 minutes
            </p>
        </div>
    );
};