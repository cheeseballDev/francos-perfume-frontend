import { Archive, Barcode, Boxes, ChartNoAxesCombined, FileClock, HandHelping, LayoutDashboard, Logs, Tag, UserPen } from 'lucide-react';
import logo from '../../assets/FrancoPerfumeLogo.png';

const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const normalizedRole = role ? role.toLowerCase() : '';
  
  const isManager = normalizedRole === 'manager';

  const getTabClass = (tabName) => {
    return `flex items-center justify-start w-full gap-2 cursor-pointer p-5 transition-colors ${
      activeTab === tabName ? 'bg-custom-primary/20 text-custom-white border-r-20 border-custom-primary' : 'hover:bg-[#333]'
    }`;
  };

  return (
    <div className="w-64 bg-[#1E1E1E] text-white flex flex-col z-20 shrink-0">
      <div className="py-8 px-6 border-b border-[#333] flex flex-col items-center justify-center mb-4">
        <img src={logo} alt="Franco's Logo" className="h-24 w-auto object-contain mb-6" />
        <span className="text-1xl tracking-widest text-custom-gray font-semibold uppercase">Main Menu</span>
      </div>
      
      <div className="flex flex-col gap-2 overflow-y-auto ">
        <div onClick={() => setActiveTab('Dashboard')} className={getTabClass('Dashboard')}>
            <LayoutDashboard size={32}/>
            <p className="text-xl">Dashboard</p>
        </div>
    
        <div onClick={() => setActiveTab('Inventory')} className={getTabClass('Inventory')}>
            <Boxes size={32}/>
            <p className="text-xl">Inventory</p>
        </div>
      
        <div onClick={() => setActiveTab('Requests')} className={getTabClass('Requests')}>
            <HandHelping size={32}/>
            <p className="text-xl">Requests</p>
        </div>
          
        <div onClick={() => setActiveTab('Forecast')} className={getTabClass('Forecast')}>
            <ChartNoAxesCombined size={32}/>
            <p className="text-xl">Forecast</p>
        </div>

        {isManager && (
          <div onClick={() => setActiveTab('Transaction History')} className={getTabClass('Transaction History')}>
            <FileClock size={32}/>
             <p className="text-xl">Transaction History</p>
          </div>
        )}

        {isManager && (
          <div onClick={() => setActiveTab('Barcode')} className={getTabClass('Barcode')}>
            <Barcode size={32}/>
             <p className="text-xl">Barcode Generation</p>
          </div>
        )}

        {isManager && (
          <div onClick={() => setActiveTab('Discount')} className={getTabClass('Discount')}>
            <Tag size={32}/>
             <p className="text-xl">Discount Management</p>
          </div>
        )}

        {isManager && (
          <div onClick={() => setActiveTab('Audit Log')} className={getTabClass('Audit Log')}>
            <Logs size={32}/>
             <p className="text-xl">Audit Log</p>
          </div>
        )}

        {isManager && (
          <div onClick={() => setActiveTab('Accounts')} className={getTabClass('Accounts')}>
            <UserPen size={32}/>
             <p className="text-xl">Accounts</p>
          </div>
        )}

        {isManager && (
          <div onClick={() => setActiveTab('Archives')} className={getTabClass('Archives')}>
            <Archive size={32}/>
             <p className="text-xl">Archives</p>
          </div>
        )}
      

      </div>
    </div>
  );
};

export default Sidebar;