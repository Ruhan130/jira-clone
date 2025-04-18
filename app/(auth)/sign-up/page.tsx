
import { getCurrent } from '@/app/feature/auth/queries'
import { SignUpCard } from '@/app/feature/auth/component/sign-up-card'
import { redirect } from 'next/navigation';
import React from 'react'

const SignUpPage = async () => {
  const account = await getCurrent();
  if(account) redirect("/")
  return (
    <SignUpCard/>
  )
}

export default SignUpPage