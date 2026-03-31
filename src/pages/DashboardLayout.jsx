import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Inventory from './Inventory';
import POS from './POS';

const DashboardLayout = ({ trueRole, activeRole: initialActiveRole, userEmail, onLogout }) => {
  const baseRole = trueRole ? trueRole.toLowerCase() : '';
  const [currentActiveRole, setCurrentActiveRole] = useState(initialActiveRole ? initialActiveRole.toLowerCase() : baseRole);

  const isCashier = currentActiveRole === 'cashier staff' || currentActiveRole === 'cashier';
  const [activeTab, setActiveTab] = useState(isCashier ? 'POS' : 'Dashboard'); 

  useEffect(() => {
    if (currentActiveRole === 'cashier staff') {
      setActiveTab('POS');
    } else if (currentActiveRole === 'manager') {
      setActiveTab('Dashboard');
    }
  }, [currentActiveRole]);

  const handleSwitchAccess = () => {
    if (currentActiveRole === 'manager') {
      setCurrentActiveRole('cashier staff');
    } else {
      setCurrentActiveRole('manager');
    }
  };

  const canSwitchAccess = baseRole === 'manager';

  // ==========================================
  // NEW: FULL SCREEN TAKEOVER FOR POS
  // ==========================================
  if (activeTab === 'POS') {
    return (
      <POS 
        userEmail={userEmail}
        onLogout={onLogout}
        canSwitchAccess={canSwitchAccess}
        onSwitchAccess={handleSwitchAccess}
      />
    );
  }

  // STANDARD DASHBOARD LAYOUT (For all other tabs)
  return (
    <div className="flex h-screen bg-[#F7F7F9] text-[#333] font-montserrat text-[16px]">
      <Sidebar role={currentActiveRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header role={currentActiveRole} userEmail={userEmail} onLogout={onLogout} canSwitchAccess={canSwitchAccess} onSwitchAccess={handleSwitchAccess} />
        <main className="flex-1 p-8 overflow-auto bg-[#F7F7F9]">
          
          {activeTab === 'Dashboard' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-2 leading-none tracking-tight">Dashboard</h1>
              <div className="h-64 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">Placeholder</div>
            </div>
          )}

          {activeTab === 'Inventory' && <Inventory />}
          
          {activeTab === 'Requests' && <h1 className="text-[32px] font-bold">Delivery Requests</h1>}
          {activeTab === 'Transaction History' && <h1 className="text-[32px] font-bold">Transaction History</h1>}
          {activeTab === 'Forecast' && <h1 className="text-[32px] font-bold">Sales Forecasting</h1>}

        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;