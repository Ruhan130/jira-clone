import { UserButton } from "@/app/feature/auth/component/user-button"
import { ModleSidebar } from "./mobile-sidebar"

export const NavBar = () => {
    return (
        <div className="pt-4 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex">
                <h1 className="text-2xl font-semibold">
                    Home
                </h1>
                <p className="text-muted-foreground and tasks here">
                    Monitor all your project and tasks here
                </p>
            </div>
            <ModleSidebar />
            <UserButton />
        </div>
    )
}