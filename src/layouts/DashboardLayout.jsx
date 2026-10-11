import { useAuth } from "@/auth/UseAuth";
import { Outlet } from "react-router-dom";
import Header from "../components/shared/Header";
import Sidebar from "../components/shared/SideBar";

const DashboardLayout = () => {
  const { activeRole, email: userEmail } = useAuth();

  return (
    // FIXED: Replaced bg-custom-white and text-custom-black with bg-background and text-foreground
    <div className="flex h-screen bg-background text-foreground font-montserrat text-[16px]">
      <Sidebar/>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header/>
        {/* FIXED: Replaced bg-custom-white with bg-background */}
        <main className="flex-1 p-8 overflow-auto bg-background">
          <Outlet context={{ activeRole, userEmail }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;