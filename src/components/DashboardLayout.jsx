import React from 'react';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#F7F7F9] text-[#333] font-sans text-[16px]">
      
      {/* SIDEBAR: w-64 (256px) - Perfect multiple of 8 */}
      <div className="w-64 bg-[#1E1E1E] text-white flex flex-col">
        
        {/* LOGO AREA: h-16 (64px height), p-6 (24px padding) */}
        <div className="h-16 p-6 border-b border-[#333] flex items-center justify-center">
          <h2 className="text-[24px] tracking-widest text-center font-semibold text-[#D4C4B0]">FRANCO'S</h2>
        </div>
        
        {/* NAVIGATION: p-6 (24px padding), gap-4 (16px spacing between elements) */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 cursor-pointer bg-[#333] p-2 rounded">
             {/* Placeholder for icon */}
             <div className="w-4 h-4 bg-gray-400"></div>
             <p className="font-medium text-[#D4C4B0]">Dashboard</p>
          </div>
          <div className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#333] transition-colors rounded">
             <div className="w-4 h-4 bg-gray-500"></div>
             <p className="text-gray-300">Inventory</p>
          </div>
          <div className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#333] transition-colors rounded">
             <div className="w-4 h-4 bg-gray-500"></div>
             <p className="text-gray-300">Requests</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER: h-16 (64px height), px-8 (32px horizontal padding) */}
        <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 shadow-sm">
          
          {/* Sub-text/Caption size: 14px */}
          <div className="flex gap-8 text-[14px] text-gray-600">
             <p><span className="font-semibold text-gray-800">Date:</span> YYYY/MM/DD</p>
             <p><span className="font-semibold text-gray-800">Location:</span> Sta. Lucia</p>
          </div>
          
          <div className="text-[14px] flex items-center gap-2 cursor-pointer font-medium hover:text-gray-600 transition-colors">
             <span>User Name</span>
             <span className="text-xs">▼</span>
          </div>
        </header>

        {/* PAGE CONTENT: p-8 (32px internal padding based on your card padding rules) */}
        <main className="flex-1 p-8 overflow-auto">
          {/* H1 Hero Size: 48px, Bold, mb-8 (32px bottom margin) */}
          <h1 className="text-[48px] font-bold text-gray-900 mb-8 leading-none tracking-tight">
            Dashboard
          </h1>
          
          {/* Content will go here */}
          <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
            Main content goes here (Charts, Tables, etc.)
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;