import { UserButton } from "../feature/auth/component/user-button";
import Link from "next/link";
import Image from "next/image";

interface StandAloneLayoutProps {
    children: React.ReactNode;
}
const StandAloneLayout = ({ children }: StandAloneLayoutProps) => {
    return (
        <main>
            <div className="bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-screen-2xl p-4">
                    <nav className="flex justify-between items-center h-[73px]">
                        <Link href="/">
                            <Image src="/Myra_Logo.png" alt="Logo" width={70} height={20} />
                        </Link>
                        <UserButton />

                    </nav>
                    <div className="flex flex-col items-center justify-center py-4">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default StandAloneLayout