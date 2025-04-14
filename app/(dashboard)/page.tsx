"use  server"

import { redirect } from "next/navigation";
import { getCurrent } from "../feature/auth/actions";
import { UserButton } from "../feature/auth/component/user-button";
import { CreateWorkSpaceForm } from "../feature/workspaces/component/create-workspace-form";

export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="bg-neutral-500 h-full p-4" >
      <CreateWorkSpaceForm />
    </div>
  );
}
