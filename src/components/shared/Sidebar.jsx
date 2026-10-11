import { useAuth } from "@/auth/UseAuth";
import {
  Archive,
  Barcode,
  Boxes,
  ChartNoAxesCombined,
  FileClock,
  HandHelping,
  LayoutDashboard,
  Logs,
  ShoppingBag,
  Tag,
  Truck,
  UserPen
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/FrancoPerfumeLogo.png";

const SideBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const companyPictureAlt = "Franco's Logo";
  
  const normalizedRole = user?.trueRole || "";
  const isManager = normalizedRole === "MANAGER";
  const isOwner = normalizedRole === "OWNER";
  const isAdmin = normalizedRole === "ADMIN";
  const isStaff = normalizedRole === "STAFF";

  const hasManagementAccess = isManager || isOwner;
  const hasFullAccess = isManager || isOwner || isAdmin;

  const getTabClass = (path) => {
    const isActive = location.pathname.startsWith(path); 
    
    const isActuallyActive = path === "/home" 
    ? location.pathname === "/home" 
    : isActive;

    // FIXED: Replaced custom colors with semantic background, foreground, and primary variables
    return `flex items-center w-full gap-2 cursor-pointer p-5 transition-colors duration-300
    ${isActuallyActive
      ? "bg-primary/20 text-foreground border-r-4 border-primary"
      : "hover:bg-muted text-muted-foreground hover:text-foreground"
    }`;
  };

  return (
    // FIXED: Replaced bg-custom-black with bg-sidebar/bg-card, added border-r to separate from main content
    <div className="w-64 bg-card border-r border-border text-card-foreground flex flex-col z-20 shrink-0 h-full">
      
      {/* FIXED: Replaced border-white/10 with standard border-border */}
      <div className="py-6 px-6 border-b border-border flex flex-col items-center justify-center">
        {/* FIXED: Added max-w-[160px] to physically stop the logo from blowing up the layout */}
        <img
          src={logo}
          alt={companyPictureAlt}
          className="h-24 w-auto max-w-[160px] object-contain mb-6"
        />
        {/* FIXED: Replaced text-custom-gray with text-muted-foreground */}
        <span className="text-sm tracking-widest text-muted-foreground font-semibold uppercase">
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

        {/* FORECAST - Restricted from Admin and Staff */}
        {!isAdmin && !isStaff && (
          <Link to="/home/forecast" className={getTabClass("/home/forecast")}>
            <ChartNoAxesCombined size={24} />
            <p className="text-base">Sales Forecast</p>
          </Link>
        )}

        {/* REQUESTS - Restricted from Admin */}
        {!isAdmin && (
          <Link to="/home/requests" className={getTabClass("/home/requests")}>
            <HandHelping size={24} />
            <p className="text-base">Requests</p>
          </Link>
        )}

        {/* DELIVERIES - Restricted from Admin */}
        {!isAdmin && (
          <Link to="/home/deliveries" className={getTabClass("/home/deliveries")}>
            <Truck size={24} />
            <p className="text-base">Deliveries</p>
          </Link>
        )}

        {/* TRANSACTIONS - Manager & Owner Only */}
        {hasManagementAccess && (
          <Link to="/home/transactions" className={getTabClass("/home/transactions")}>
            <FileClock size={24} />
            <p className="text-base">Transactions List</p>
          </Link>
        )}

        {/* PRODUCTS - Owner Only */}
        {isOwner && (
          <Link to="/home/products" className={getTabClass("/home/products")}>
            <ShoppingBag size={24} />
            <p className="text-base">Products</p>
          </Link>
        )}

        {/* BARCODE - Staff, Manager, and Owner */}
        {(isStaff || isManager || isOwner) && (
          <Link to="/home/barcode" className={getTabClass("/home/barcode")}>
            <Barcode size={24} />
            <p className="text-base">Barcode</p>
          </Link>
        )}

        {/* DISCOUNT - Owner Only */}
        {isOwner && (
          <Link to="/home/discount" className={getTabClass("/home/discount")}>
            <Tag size={24} />
            <p className="text-base">Discount</p>
          </Link>
        )}

        {/* --- ADMINISTRATIVE SECTION --- */}

        {/* AUDIT LOG - Manager, Owner, and Admin */}
        {hasFullAccess && (
          <Link to="/home/audit" className={getTabClass("/home/audit")}>
            <Logs size={24} />
            <p className="text-base">Audit Log</p>
          </Link>
        )}

        {/* ACCOUNTS - Manager, Owner, and Admin */}
        {hasFullAccess && (
          <Link to="/home/accounts" className={getTabClass("/home/accounts")}>
            <UserPen size={24} />
            <p className="text-base">Accounts</p>
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

export default SideBar;