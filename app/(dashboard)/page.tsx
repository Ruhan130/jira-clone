"use  server"

import { redirect } from "next/navigation";
import { getCurrent } from "../feature/auth/actions";
import { UserButton } from "../feature/auth/component/user-button";
import { getWorkspaces } from "../feature/workspaces/actions";

export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");
  const workspaces = await getWorkspaces();
  if (workspaces.total === 0) {
    redirect("/workspaces/")
  } else {
    redirect(`/workspaces/${workspaces.documents[0].$id}`);
  }
}
