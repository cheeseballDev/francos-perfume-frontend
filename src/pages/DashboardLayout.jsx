import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Inventory from './Inventory';

const DashboardLayout = ({ trueRole, activeRole: initialActiveRole, userEmail, onLogout }) => {
  // 1. Establish their permanent security clearance (True Role)
  const baseRole = trueRole ? trueRole.toLowerCase() : '';
  
  // 2. Track what UI they are currently viewing (Active Role)
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

  // 3. Only Managers are allowed to see the "Switch Access" button!
  const canSwitchAccess = baseRole === 'manager';

  return (
    <div className="flex h-screen bg-[#F7F7F9] text-[#333] font-montserrat text-[16px]">
      
      <Sidebar 
        role={currentActiveRole} // Sidebar uses active role
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        <Header 
          role={currentActiveRole} 
          userEmail={userEmail} 
          onLogout={onLogout} 
          canSwitchAccess={canSwitchAccess} // Header checks True Role
          onSwitchAccess={handleSwitchAccess} 
        />

        <main className="flex-1 p-8 overflow-auto bg-[#F7F7F9]">
          
          {activeTab === 'Dashboard' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-2 leading-none tracking-tight">Dashboard</h1>
              <p className="text-gray-500 text-sm mb-8">System overview and quick metrics.</p>
              <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                Metrics Dashboard Placeholder
              </div>
            </div>
          )}

          {activeTab === 'Inventory' && <Inventory />}
          
          {activeTab === 'Requests' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-8 leading-none tracking-tight">Delivery Requests</h1>
            </div>
          )}

          {activeTab === 'POS' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-8 leading-none tracking-tight">Point of Sale (POS)</h1>
            </div>
          )}

          {activeTab === 'Transaction History' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-8 leading-none tracking-tight">Transaction History</h1>
            </div>
          )}

          {activeTab === 'Forecast' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-8 leading-none tracking-tight">Sales Forecasting</h1>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;