"use  server"

import { redirect } from "next/navigation";
import { getCurrent } from "../feature/auth/queries";
import { getWorkspaces } from "../feature/workspaces/queries";

export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");
  const workspaces = await getWorkspaces();
  if (workspaces.total === 0) {
    redirect("/workspaces/create")
  } else {
    redirect(`/workspaces/${workspaces.documents[0].$id}`);
  }
}
