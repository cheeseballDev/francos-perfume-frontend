import { useAuth } from "@/auth/UseAuth";
import { Sidebar } from "@/components/shared";
import { Outlet } from "react-router-dom";
import Header from "../components/shared/Header";

const DashboardLayout = () => {
    // useAuth() returns { user, ... }; reading activeRole/email off it directly gave undefined
    const { user } = useAuth();
    const activeRole = user?.trueRole;
    const userEmail = user?.email;

    return (
        <div className="flex h-screen bg-background text-foreground font-montserrat text-[16px]">
        <Sidebar/>
        <div className="flex-1 flex flex-col overflow-hidden relative">
            <Header/>
            <main className="flex-1 p-8 overflow-auto bg-background">
                <Outlet context={{ activeRole, userEmail }} />
            </main>
        </div>
        </div>
    );
};

export default DashboardLayout;