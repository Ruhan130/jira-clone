import Image from "next/image";
import Link from "next/link";
import { DottedSeperator } from "./dotted-seperater.tsx/dotted-seperater";
import { NavigationBar } from "./navigation-bar";
import { WorkspaceSwitcher } from "./workspace-switcher";
import Projects from "./projects";

export const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <div className="flex justify-center">
                <Link href="">
                    <Image src="/ec_logo.png" alt="logo" width={70} height={20} />
                </Link>
            </div>
            <DottedSeperator className="my-4" />
            <WorkspaceSwitcher />
            <DottedSeperator className="my-4" />
            <NavigationBar />
            <DottedSeperator className="my-4" />
            <Projects />
        </aside>
    );
};
