
export const dynamic = 'force-dynamic';

import { getCurrent } from '@/app/feature/auth/queries'
import { redirect } from 'next/navigation';
import React from 'react'
import { ForgetTesting } from '@/app/feature/auth/component/forget-test';
import { EnterPasswordForm } from '@/app/feature/auth/component/enter-password';

const EnterPassword = async () => {
    const account = await getCurrent();
    if (account) redirect("/")
    return (
        <EnterPasswordForm />
    )
}

export default EnterPassword