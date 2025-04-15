import Image from "next/image";
import Link from "next/link";
import { DottedSeperator } from "./dotted-seperater.tsx/dotted-seperater";
import { NavigationBar } from "./navigation-bar";
import { WorkspaceSwitcher } from "./workspace-switcher";

export const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <Link href="">
                <Image src="/logo.svg" alt="logo" width={164} height={48} />
            </Link>
            <DottedSeperator className="my-4" />
            <WorkspaceSwitcher />
            <DottedSeperator className="my-4" />
            <NavigationBar />
        </aside>
    );
};
