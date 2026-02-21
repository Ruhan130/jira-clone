export const dynamic = 'force-dynamic';

import { getCurrent } from '@/app/feature/auth/queries'
import { SignInCard } from '@/app/feature/auth/component/sign-in-card'
import { redirect } from 'next/navigation';
import React from 'react'
import { LoginCard } from '@/app/feature/auth/component/login-card';

const SignInPage = async () => {
  const account = await getCurrent();
  if (account) redirect("/");

  return (
    // <SignInCard/>
    <LoginCard />
  )
}

export default SignInPage