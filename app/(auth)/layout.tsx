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
        <main className="bg-neutral-100 min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center">
                    <Image src="/logo.svg" alt="Logo" width={156} height={56} />
                    <Button asChild variant='secondary'>
                        <Link href={isSignInPage ? "/sign-up" : "sign-in"}> 
                            {isSignInPage ? "Sign-up" : "Login  "}
                        </Link>
                    </Button>
                </nav>
                <div className="flex flex-col items-center justify-center p-4 md:p-14">
                    {children}
                </div>
            </div>
        </main>
    )
}

export default AuthLayout