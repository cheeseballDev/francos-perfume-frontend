import { useAuth } from '@/auth/UseAuth';
import { formatDateForTable } from '@/utils/formattingUtils';
import { Moon, Sun } from 'lucide-react'; // ADDED: Imported icons for the theme toggle
import { useEffect, useState } from 'react';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState("");
  const [userLocation, setUserLocation] = useState("Loading...");
  
  // ADDED: Local state to track the theme based on the root HTML element
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  // ADDED: Function to inject or remove the 'dark' class on the HTML element
  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    setIsDark(!isDark);
  };
  
  useEffect(() => {
    try {
      setCurrentDate(formatDateForTable(new Date()));
      setUserLocation(user.branchLocation);
    } catch (error) {
      console.error("Header initialization error:", error);
      setUserLocation("Error loading location");
    }
  }, [user.branchLocation]);

  if (!user) {
     return (
       <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm z-10 shrink-0 font-montserrat">
          <div className="text-muted-foreground text-sm animate-pulse">Loading profile...</div>
       </header>
     );
  }

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm z-10 shrink-0 font-montserrat">
        <div className="flex gap-8 text-sm text-muted-foreground items-center">
           <p><span className="font-semibold text-foreground">Date:</span> {currentDate}</p>

           <div className="flex items-center gap-2">
             <span className="font-semibold text-foreground">Location:</span>
             <span className="text-muted-foreground bg-muted px-3 py-1 rounded border border-border font-medium">
                {userLocation}
             </span>
           </div>
        </div>
        
        {/* FIXED: Wrapped the new toggle button and the ProfileDropdown in a flex container to align them */}
        <div className="flex items-center gap-4">
          
          {/* ADDED: Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <ProfileDropdown/>
        </div>
        
      </header>
    </>
  );
};

export default Header;