"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Mail, CopyIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageLoader } from "@/components/page-loader";
import { useGetWorkspace } from "../../workspaces/api/use-get-workspace";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { inviteCoworkersSchema } from "../schemas";
import { MemberType } from "../../members/type";
import { useInviteCoworkers } from "../api/use-invite-coworkers";

export const InviteTeam = () => {
  const router = useRouter();
  const workspaceId = UseWorkspaceId();
  const { data: workspace, isLoading } = useGetWorkspace({ workspaceId });
  const { mutate: inviteCoworkers, isPending } = useInviteCoworkers();

  const form = useForm<z.infer<typeof inviteCoworkersSchema>>({
    resolver: zodResolver(inviteCoworkersSchema),
    defaultValues: {
      invites: [{ email: "", role: MemberType.MEMBER }],
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "invites",
  });

  const fullInviteLink = `${window.location.origin}/workspaces/${workspaceId}/join/${workspace?.workspaceUrl}`;

  const handleInviteLink = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() => toast.success("Invite Link copied to the clipboard"));
  };

  const handleInviteWithEmail = () => {
    const values = form.getValues();


    form.trigger().then((isValid) => {
      if (!isValid) {
        toast.error("Please fix the form errors");
        return;
      }


      const validInvites = values.invites.filter(invite => invite.email.trim() !== "");

      if (validInvites.length === 0) {
        toast.error("Please enter at least one email address");
        return;
      }


      inviteCoworkers({
        param: { workspaceId },
        json: { invites: validInvites }
      }, {
        onSuccess: () => {
          form.reset({
            invites: [{ email: "", role: MemberType.MEMBER }]
          });
        }
      });
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="w-full max-w-lg bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Invite co-workers to your team
        </h1>
      </div>

      <Form {...form}>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3 text-sm font-medium text-gray-700 mb-2">
            <span>Email</span>
            <span>Role</span>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name={`invites.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter email"
                        disabled={isPending}
                        className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`invites.${index}.role`}
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MemberType.ADMIN}>Admin</SelectItem>
                        <SelectItem value={MemberType.MEMBER}>Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ email: "", role: MemberType.MEMBER })}
            disabled={isPending}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add another
          </button>
        </div>
      </Form>

      {/* Invite Link Section */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Invite link</h3>
        <p className="text-sm text-gray-600 mb-3">
          Share this link with others you'd like to join your workspace.
        </p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={fullInviteLink}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-600"
          />
          <Button
            variant="secondary"
            onClick={handleInviteLink}
            disabled={isPending}
            className="size-12"
          >
            <CopyIcon className="size-5" />
          </Button>
        </div>
      </div>

      {/* Invite with Email Button */}
      <button
        type="button"
        onClick={handleInviteWithEmail}
        disabled={isPending}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Mail className="h-4 w-4" />
        <span className="text-sm font-medium">
          {isPending ? "Sending invitations..." : "Invite with email"}
        </span>
      </button>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.replace("/workspaces/welcome")}
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={() => router.replace("/workspaces/welcome")}
          disabled={isPending}
          className="w-full text-gray-600 hover:text-gray-700 font-medium py-2 px-4 rounded-md disabled:opacity-50"
        >
          I'll do it later
        </button>
      </div>
    </div>
  );
};