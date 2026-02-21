"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
interface AuthLayoutProps {
    children: React.ReactNode;
};


const AuthLayout = ({ children }: AuthLayoutProps) => {
    const pathname = usePathname();
    const isSignInPage = pathname === "/sign-in";


    return (
        <main className="min-h-screen bg-[url('/auth-bg.jpeg')] bg-cover bg-center flex flex-col">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center">
                    <Image src="/Myra_Logo.png" alt="Logo" width={70} height={20} />
                </nav>
                <div className="flex flex-col items-center justify-center p-4 md:p-14">
                    {children}
                </div>
            </div>

        </main>
    )
}

export default AuthLayout