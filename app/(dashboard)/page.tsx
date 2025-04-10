"use  server"

import { redirect } from "next/navigation";
import { getCurrent } from "../feature/auth/actions";
import { UserButton } from "../feature/auth/component/user-button";

export default async function Home() {
  const user =await  getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div >

      <UserButton />
    </div>
  );
}
