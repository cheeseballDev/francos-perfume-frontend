import {
  Archive,
  Barcode,
  Boxes,
  ChartNoAxesCombined,
  FileClock,
  HandHelping,
  LayoutDashboard,
  Logs,
  Tag,
  UserPen
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/FrancoPerfumeLogo.png";

const Sidebar = ({ user }) => {
  const location = useLocation();

  const companyPictureAlt = "Franco's Logo";
  
  // --- ROLE BASED ACCESS LOGIC ---
  const normalizedRole = user?.trueRole?.toLowerCase() || "";
  const isManager = normalizedRole === "manager";
  const isOwner = normalizedRole === "owner";
  const isAdmin = normalizedRole === "admin";
  
  // Access Groups
  const hasManagementAccess = isManager || isOwner;
  const hasFullAccess = isManager || isOwner || isAdmin;

  const getTabClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center w-full gap-2 cursor-pointer p-5 transition-colors duration-300
    ${
      isActive
        ? "bg-custom-primary/20 text-custom-white border-r-4 border-custom-primary"
        : "hover:bg-white/10 text-custom-gray"
    }`;
  };

  return (
    <div className="w-64 bg-custom-black text-custom-white flex flex-col z-20 shrink-0 h-full">
      <div className="py-6 px-6 border-b border-white/10 flex flex-col items-center justify-center ">
        <img
          src={logo}
          alt={companyPictureAlt}
          className="h-24 w-auto object-contain mb-6"
        />
        <span className="text-sm tracking-widest text-custom-gray font-semibold uppercase">
          Main Menu
        </span>
      </div>

      <div className="w-full flex flex-col gap-2 overflow-y-auto sidebar-scroll pb-4">
        
        {/* DASHBOARD - Always visible */}
        <Link to="/home" className={getTabClass("/home")}>
          <LayoutDashboard size={24} />
          <p className="text-base">Dashboard</p>
        </Link>

        {/* INVENTORY - Restricted from Admin */}
        {!isAdmin && (
          <Link to="/home/inventory" className={getTabClass("/home/inventory")}>
            <Boxes size={24} />
            <p className="text-base">Inventory</p>
          </Link>
        )}

        {/* RESTOCK - Restricted from Admin */}
        {!isAdmin && (
          <Link to="/home/restock" className={getTabClass("/home/restock")}>
            <HandHelping size={24} />
            <p className="text-base">Restock</p>
          </Link>
        )}

        {/* FORECAST - Restricted from Admin */}
        {!isAdmin && (
          <Link to="/home/forecast" className={getTabClass("/home/forecast")}>
            <ChartNoAxesCombined size={24} />
            <p className="text-base">Forecast</p>
          </Link>
        )}

        {/* TRANSACTIONS - Manager & Owner Only */}
        {hasManagementAccess && (
          <Link to="/home/transactions" className={getTabClass("/home/transactions")}>
            <FileClock size={24} />
            <p className="text-base">Transactions</p>
          </Link>
        )}

        {/* BARCODE - Manager Only */}
        {isManager && (
          <Link to="/home/barcode" className={getTabClass("/home/barcode")}>
            <Barcode size={24} />
            <p className="text-base">Barcode</p>
          </Link>
        )}

        {/* DISCOUNT - Manager & Owner Only */}
        {hasManagementAccess && (
          <Link to="/home/discount" className={getTabClass("/home/discount")}>
            <Tag size={24} />
            <p className="text-base">Discount</p>
          </Link>
        )}

        {/* --- ADMINISTRATIVE SECTION --- */}

        {/* ACCOUNTS - Manager, Owner, and Admin */}
        {hasFullAccess && (
          <Link to="/home/accounts" className={getTabClass("/home/accounts")}>
            <UserPen size={24} />
            <p className="text-base">Accounts</p>
          </Link>
        )}

        {/* AUDIT LOG - Manager, Owner, and Admin */}
        {hasFullAccess && (
          <Link to="/home/audit" className={getTabClass("/home/audit")}>
            <Logs size={24} />
            <p className="text-base">Audit Log</p>
          </Link>
        )}

        {/* ARCHIVES - Manager, Owner, and Admin */}
        {hasFullAccess && (
          <Link to="/home/archives" className={getTabClass("/home/archives")}>
            <Archive size={24} />
            <p className="text-base">Archives</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;