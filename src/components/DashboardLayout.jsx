import React, { useState, useEffect } from 'react';
import logo from '../assets/FrancoPerfumeLogo.png';
import Inventory from './Inventory'; 

const DashboardLayout = ({ role, userEmail, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Sta. Lucia");
  const [activeTab, setActiveTab] = useState('Dashboard'); 
  
  useEffect(() => {
    const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };
    const phtDate = new Intl.DateTimeFormat('en-CA', options).format(new Date());
    setCurrentDate(phtDate.replace(/-/g, '/'));
  }, []);

  const displayUsername = userEmail ? userEmail.split('@')[0] : 'User';
  
  // ROLE-BASED SECURITY LOGIC
  const normalizedRole = role ? role.toLowerCase() : '';
  
  const isManager = normalizedRole === 'manager';
  const isAdmin = normalizedRole === 'admin';
  const isInventoryStaff = normalizedRole === 'inventory staff' || normalizedRole === 'inventory';
  const isCashierStaff = normalizedRole === 'cashier staff' || normalizedRole === 'cashier';

  const canSeeInventory = isManager || isInventoryStaff;
  const canSeeRequests = isManager || isInventoryStaff;
  const canSeeTransactions = isManager || isCashierStaff;
  const canSeeForecast = isManager;
  const canSeeAdminTools = isAdmin;
  const canChangeLocation = isManager || isAdmin;

  return (
    <div className="flex h-screen bg-[#F7F7F9] text-[#333] font-montserrat text-[16px]">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#1E1E1E] text-white flex flex-col z-20">
        <div className="py-10 px-6 border-b border-[#333] flex flex-col items-center justify-center mb-4">
          <img src={logo} alt="Franco's Logo" className="h-24 w-auto object-contain mb-6" />
          <span className="text-[12px] tracking-widest text-gray-500 font-semibold uppercase">Main Menu</span>
        </div>
        
        <div className="p-6 flex flex-col gap-2 overflow-y-auto">
          
          {/* TAB: DASHBOARD (Everyone sees this) */}
          <div 
            onClick={() => setActiveTab('Dashboard')}
            className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-colors ${activeTab === 'Dashboard' ? 'bg-[#333] text-[#D4C4B0]' : 'hover:bg-[#333] text-gray-300'}`}
          >
             <div className="w-4 h-4 bg-gray-400"></div>
             <p className="font-medium text-sm">Dashboard</p>
          </div>
          
          {/* INVENTORY & REQUESTS */}
          {canSeeInventory && (
            <div 
              onClick={() => setActiveTab('Inventory')}
              className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-colors ${activeTab === 'Inventory' ? 'bg-[#333] text-[#D4C4B0]' : 'hover:bg-[#333] text-gray-300'}`}
            >
               <div className="w-4 h-4 bg-gray-500"></div>
               <p className="font-medium text-sm">Inventory</p>
            </div>
          )}
          
          {canSeeRequests && (
            <div 
              onClick={() => setActiveTab('Requests')}
              className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-colors ${activeTab === 'Requests' ? 'bg-[#333] text-[#D4C4B0]' : 'hover:bg-[#333] text-gray-300'}`}
            >
               <div className="w-4 h-4 bg-gray-500"></div>
               <p className="font-medium text-sm">Requests</p>
            </div>
          )}

          {/* CASHIER / POS */}
          {canSeeTransactions && (
            <div 
              onClick={() => setActiveTab('Transactions')}
              className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-colors ${activeTab === 'Transactions' ? 'bg-[#333] text-[#D4C4B0]' : 'hover:bg-[#333] text-gray-300'}`}
            >
               <div className="w-4 h-4 bg-gray-500"></div>
               <p className="font-medium text-sm">Transactions (POS)</p>
            </div>
          )}
              
          {/* FORECASTING */}
          {canSeeForecast && (
            <div 
              onClick={() => setActiveTab('Forecast')}
              className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-colors ${activeTab === 'Forecast' ? 'bg-[#333] text-[#D4C4B0]' : 'hover:bg-[#333] text-gray-300'}`}
            >
               <div className="w-4 h-4 bg-gray-500"></div>
               <p className="font-medium text-sm">Forecast</p>
            </div>
          )}

          {/* ADMIN EXCLUSIVE TOOLS */}
          {canSeeAdminTools && (
            <>
              <div className="mt-4 mb-2 px-2 text-[10px] tracking-widest text-gray-500 font-bold uppercase">System Admin</div>
              
              <div 
                onClick={() => setActiveTab('Accounts')}
                className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-colors ${activeTab === 'Accounts' ? 'bg-[#333] text-[#D4C4B0]' : 'hover:bg-[#333] text-gray-300'}`}
              >
                 <div className="w-4 h-4 bg-gray-500"></div>
                 <p className="font-medium text-sm">Accounts</p>
              </div>
              
              <div 
                onClick={() => setActiveTab('Audit Logs')}
                className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-colors ${activeTab === 'Audit Logs' ? 'bg-[#333] text-[#D4C4B0]' : 'hover:bg-[#333] text-gray-300'}`}
              >
                 <div className="w-4 h-4 bg-gray-500"></div>
                 <p className="font-medium text-sm">Audit Logs</p>
              </div>
              
              <div 
                onClick={() => setActiveTab('Archives')}
                className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-colors ${activeTab === 'Archives' ? 'bg-[#333] text-[#D4C4B0]' : 'hover:bg-[#333] text-gray-300'}`}
              >
                 <div className="w-4 h-4 bg-gray-500"></div>
                 <p className="font-medium text-sm">Archives</p>
              </div>
            </>
          )}
        </div>
      </div> {/* <-- THESE ARE THE DIVS YOU ACCIDENTALLY DELETED */}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 shadow-sm z-10">
          
          <div className="flex gap-8 text-[14px] text-gray-600 items-center">
             <p><span className="font-semibold text-gray-800">Date:</span> {currentDate}</p>
             
             <div className="flex items-center gap-2">
               <span className="font-semibold text-gray-800">Location:</span>
               {canChangeLocation ? (
                 <select 
                   value={selectedLocation}
                   onChange={(e) => setSelectedLocation(e.target.value)}
                   className="border border-[#C0C0C0] rounded px-2 py-1 text-gray-700 bg-white text-sm cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4C4B0] transition-colors"
                 >
                   <option value="All">All Branches</option>
                   <option value="Sta. Lucia">Sta. Lucia</option>
                   <option value="Riverbanks">Riverbanks</option>
                 </select>
               ) : (
                 <span className="text-gray-600">Sta. Lucia</span>
               )}
             </div>
          </div>
          
          <div className="relative">
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-[14px] flex items-center gap-2 cursor-pointer font-medium hover:text-gray-600 transition-colors"
            >
               <span className="capitalize">{displayUsername}</span>
               <span className="text-xs">▼</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-4 w-48 bg-white border border-[#E5E5E5] rounded shadow-lg overflow-hidden flex flex-col z-50">
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-[#E5E5E5]">
                  <div className="w-4 h-4 bg-gray-400"></div>
                  <span className="text-sm text-gray-700 font-medium">Settings</span>
                </div>
                
                <div 
                  onClick={() => {
                    setIsDropdownOpen(false); 
                    setShowLogoutModal(true); 
                  }}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer bg-[#7D162E] hover:bg-[#631124] transition-colors text-white"
                >
                  <div className="w-4 h-4 bg-white/70"></div>
                  <span className="text-sm font-medium">Logout</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT */}
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

          {activeTab === 'Accounts' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-8 leading-none tracking-tight">Manage Accounts</h1>
            </div>
          )}

          {activeTab === 'Audit Logs' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-8 leading-none tracking-tight">System Audit Logs</h1>
            </div>
          )}

          {activeTab === 'Archives' && (
            <div className="animate-fade-in">
              <h1 className="text-[32px] font-bold text-gray-900 mb-8 leading-none tracking-tight">Archived Data</h1>
            </div>
          )}

        </main>

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
            <div className="bg-white p-8 rounded-md shadow-2xl max-w-sm w-full mx-4 border border-gray-100 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Sign Out</h3>
              <p className="text-gray-600 mb-8 text-sm">Are you sure you want to end your current session?</p>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="px-5 py-2.5 border border-[#C0C0C0] rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={onLogout}
                  className="px-5 py-2.5 bg-[#7D162E] text-white rounded font-medium hover:bg-[#631124] transition-colors text-sm"
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardLayout;