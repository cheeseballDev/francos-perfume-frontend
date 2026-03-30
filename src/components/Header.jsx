import React, { useState, useEffect } from 'react';
import { Settings, ArrowRightLeft, LogOut } from 'lucide-react'; // Importing exact icons

const Header = ({ role, userEmail, onLogout, canSwitchAccess, onSwitchAccess }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Sta. Lucia");

  useEffect(() => {
    const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };
    const phtDate = new Intl.DateTimeFormat('en-CA', options).format(new Date());
    setCurrentDate(phtDate.replace(/-/g, '/'));
  }, []);

  const displayUsername = userEmail ? userEmail.split('@')[0] : 'User';
  
  const normalizedRole = role ? role.toLowerCase() : '';
  const canChangeLocation = normalizedRole === 'manager';

  return (
    <>
      <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
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

          {/* UPDATED DARK DROPDOWN MENU */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-4 w-48 bg-[#1E1E1E] text-white rounded shadow-lg overflow-hidden flex flex-col z-50">
              
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#333] transition-colors">
                <Settings size={18} className="text-gray-300" />
                <span className="text-sm font-medium">Settings</span>
              </div>
              
              {canSwitchAccess && (
                <div 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onSwitchAccess();
                  }}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#333] transition-colors"
                >
                  <ArrowRightLeft size={18} className="text-gray-300" />
                  <span className="text-sm font-medium">Switch Access</span>
                </div>
              )}
              
              <div 
                onClick={() => {
                  setIsDropdownOpen(false); 
                  setShowLogoutModal(true); 
                }}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer bg-[#7D162E] hover:bg-[#631124] transition-colors"
              >
                <LogOut size={18} className="text-gray-100" />
                <span className="text-sm font-medium">Logout</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white p-8 rounded-md shadow-2xl max-w-sm w-full mx-4 border border-gray-100 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Sign Out</h3>
            <p className="text-gray-600 mb-8 text-sm">Are you sure you want to end your current session?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-5 py-2.5 border border-[#C0C0C0] rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={onLogout} className="px-5 py-2.5 bg-[#7D162E] text-white rounded font-medium hover:bg-[#631124] transition-colors text-sm">
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;