"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { useCheckUser } from "../api/get-all-users";
import { signInWithGoogle, signUpWithMicrosoft } from "@/lib/oAuth";
import { useSendVerificationCode } from "../api/use-send-magic-link";
import { toast } from "sonner";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useValidateInvite } from "../api/get-invite-data";
import { FaMicrosoft } from "react-icons/fa";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

interface InviteData {
  email: string;
  role: string;
  workspaceId: string;
  workspaceName: string;
  workspaceUrl: string;
  userExists: boolean;
  invitedBy: string;
  expiresAt: string;
}

export const LoginCard = () => {
  const form = useForm<{ email: string }>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const sendVerificationCodeMutation = useSendVerificationCode();
  const checkUserMutation = useCheckUser();


  const inviteToken = searchParams.get('invite');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const { mutate: validateInvite, isPending: inviteLoading } = useValidateInvite();


  useEffect(() => {
    if (inviteToken && !inviteData) {
      validateInvite({ token: inviteToken }, {
        onSuccess: (data) => {
          if ('data' in data && data.data) {
            setInviteData(data.data);
            form.setValue('email', data.data.email);
          }
        },
        onError: (error) => {
          console.error('Invite validation failed:', error);
          toast.error(error.message);
        }
      });
    }
  }, [inviteToken, inviteData, validateInvite, form]);

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      const userCheck = await checkUserMutation.mutateAsync({ email });

      if (userCheck.isNewUser) {
        await sendVerificationCodeMutation.mutateAsync({ email });
        const verifyUrl = `/verify-code?email=${encodeURIComponent(email)}${inviteToken ? `&invite=${inviteToken}` : ''}`;
        router.push(verifyUrl);
      } else {
        if (userCheck.provider === "google") {
          toast.info("You used a social account to sign up. Please sign in with that.");
          return;
        } else {
          const passwordUrl = `/enter-password?email=${encodeURIComponent(email)}${inviteToken ? `&invite=${inviteToken}` : ''}`;
          router.push(passwordUrl);
        }
      }

    } catch (error) {
      console.error("Login flow error:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };



  const isLoading = sendVerificationCodeMutation.isPending || checkUserMutation.isPending;

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

        {/* ✅ Invite Context Display */}
        {inviteLoading && (
          <div className="bg-blue-900/30 border border-blue-600 p-4 rounded-md mb-6">
            <p className="text-blue-200 text-sm">Validating invitation...</p>
          </div>
        )}

        {inviteData && (
          <div className="bg-blue-900/30 border border-blue-600 p-4 rounded-md mb-6">
            <h3 className="font-semibold text-blue-200 mb-1">You're Invited!</h3>
            <p className="text-blue-300 text-sm">
              Join <strong>{inviteData.workspaceName}</strong> as <strong>{inviteData.role}</strong>
            </p>
            {inviteData.userExists && (
              <p className="text-yellow-300 text-xs mt-2">
                Sign in to accept this invitation
              </p>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <label className="text-xs sm:text-sm mb-1 block">Email</label>
                  <FormControl>
                    <div className="relative">
                      <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="Your email"
                        disabled={isLoading || !!inviteData}
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
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 mt-4 border-0 disabled:opacity-50"
            >
              {checkUserMutation.isPending
                ? "Checking..."
                : sendVerificationCodeMutation.isPending
                  ? "Sending..."
                  : inviteData ? "Continue to join workspace" : "Continue with email"
              }
            </Button>

            {!inviteData && (
              <div>
                <Button
                  onClick={handleGoogleSignIn}
                  type="button"
                  disabled={isLoading}
                  className="w-full bg-transparent text-white hover:bg-blue-700 hover:border-blue-700 mt-3"
                  variant="secondary"
                >
                  <FcGoogle className="mr-2 size-5" />
                  Login with Google
                </Button>

                <Button
                  onClick={() => signUpWithMicrosoft()}
                  type="button"
                  disabled={isLoading}
                  className="w-full bg-transparent text-white hover:bg-blue-700 hover:border-blue-700 mt-3"
                  variant="secondary"
                >
                  <FaMicrosoft className="mr-2 size-5" />
                  Login with Microsoft
                </Button>
              </div>
            )}


          </form>
        </Form>

        <p className="text-xs text-center text-gray-400 mt-6">
          By creating an account, you agree to our{" "}
          <span className="underline cursor-pointer">terms of service</span> and{" "}
          <span className="underline cursor-pointer">privacy policy</span>.
        </p>
      </CardContent>
    </Card>
  );
};