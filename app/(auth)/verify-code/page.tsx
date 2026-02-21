export const dynamic = 'force-dynamic';

import { getCurrent } from '@/app/feature/auth/queries'
import { redirect } from 'next/navigation';
import React from 'react'
import {  VerifyCodeComponent } from '@/app/feature/auth/component/verify-email';


const VerifyEmail = async () => {
  const account = await getCurrent();
  if (account) redirect("/");

  return (
    <VerifyCodeComponent />
  )
}

export default VerifyEmail