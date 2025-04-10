interface DashboardLayoutProps {
    children: React.ReactNode;
}
const Dashboard = ({ children }: DashboardLayoutProps) => {
    return (
        <div>
            {children}
        </div>
    )
}