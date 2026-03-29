import React, { useState } from "react";
import RoleLogin from "./components/RoleLogin"; 
import StaffLogin from "./components/StaffLogin";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  const [view, setView] = useState("gateway");
  const [selectedRole, setSelectedRole] = useState("");

  const handleRoleSelect = (roleName) => {
    setSelectedRole(roleName);
    setView("login");
  };

  const handleGoBack = () => {
    setView("gateway");
  };

  // THIS IS NEW: The function that transitions the app to the dashboard
  const handleLoginSuccess = () => {
    setView("dashboard");
  };

  return (
    <div className="font-sans min-h-screen">
      {view === "gateway" && <RoleLogin onSelect={handleRoleSelect} />}
      
      {view === "login" && (
        <StaffLogin 
          role={selectedRole} 
          onBack={handleGoBack} 
          onLoginSuccess={handleLoginSuccess} // WE PASS IT HERE
        />
      )}
      
      {view === "dashboard" && <DashboardLayout />}
    </div>
  );
}

export default App;