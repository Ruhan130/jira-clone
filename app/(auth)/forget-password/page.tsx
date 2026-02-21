export const dynamic = 'force-dynamic';

import { getCurrent } from '@/app/feature/auth/queries'
import { redirect } from 'next/navigation';
import React from 'react'
// import ForgotPasswordForm from '@/app/feature/auth/component/forget-password';
import { ForgetTesting } from '@/app/feature/auth/component/forget-test';

const ForgetPassword = async () => {
  const account = await getCurrent();
  if(account) redirect("/")
  return (
    <ForgetTesting />
  )
}

export default ForgetPassword
