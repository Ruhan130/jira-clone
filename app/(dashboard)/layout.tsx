import { NavBar } from "@/components/navBar";
import { Sidebar } from "@/components/sidebar";
import { CreateResponsiveModal } from "../feature/workspaces/component/create-responsive-model";
import { CreateProjectModal } from "../feature/projects/component/create-project-modal";
import { CreateTaskModal } from "../feature/tasks/components/create-task-respnsive-modal";
import { EditTaskModel } from "../feature/tasks/components/edit-task-modal";

interface DashboardLayoutProps {
    children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="min-h-screen">
            <CreateResponsiveModal />
            <CreateProjectModal />
            <CreateTaskModal />
            <EditTaskModel />

            <div className="flex w-full h-full">
                <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
                    <Sidebar />
                </div>
                <div className="lg:pl-[260px] w-full" >
                    <div className="mx-auto max-w-screen-2xl h-full">
                        <NavBar />
                        <main className="h-full py-8 px-6 flex flex-col">
                            {children}
                        </main>

                    </div>
                </div>
            </div>
        </div>
    )
}
export default DashboardLayout