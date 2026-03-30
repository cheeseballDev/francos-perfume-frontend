import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Inventory from './Inventory';

const DashboardLayout = ({ role, userEmail, onLogout }) => {
  const isCashier = role && (role.toLowerCase() === 'cashier staff' || role.toLowerCase() === 'cashier');
  const [activeTab, setActiveTab] = useState(isCashier ? 'Transactions' : 'Dashboard'); 

  return (
    <div className="flex h-screen bg-[#F7F7F9] text-[#333] font-montserrat text-[16px]">
      
      <Sidebar 
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        <Header 
          role={role} 
          userEmail={userEmail} 
          onLogout={onLogout} 
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

          {activeTab === 'Transactions' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-8 leading-none tracking-tight">Point of Sale (POS)</h1>
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