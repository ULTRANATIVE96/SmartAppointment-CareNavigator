import { useNavigate, useLocation } from "react-router-dom";
import { Home, Stethoscope, Calendar, Compass } from "lucide-react";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", icon: Home, path: "/patient" },
    { label: "Symptoms", icon: Stethoscope, path: "/patient/symptoms" },
    { label: "Appointments", icon: Calendar, path: "/patient/appointment" },
    { label: "Care Journey", icon: Compass, path: "/patient/care-journey" },
  ];

  // Helper to determine if a path is active, including sub-paths
  const isActivePath = (itemPath) => {
    if (itemPath === "/patient") {
      return location.pathname === "/patient" || location.pathname === "/patient/";
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)] lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-fit lg:rounded-2xl lg:border lg:border-slate-200/60 lg:shadow-2xl lg:px-4 lg:py-2 transition-all">
      <div className="flex justify-around items-end px-2 pt-3 pb-6 max-w-2xl mx-auto h-20 lg:h-14 lg:p-0 lg:gap-4 lg:items-center">
        {navItems.map((item) => {
          const isActive = isActivePath(item.path);
          return (
            <button
              key={item.path}
              className={`flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-2.5 flex-1 lg:flex-none h-full active:scale-95 transition-all lg:px-5 lg:py-2.5 lg:rounded-xl ${
                isActive 
                  ? "lg:bg-sky-50 lg:text-sky-600" 
                  : "lg:hover:bg-slate-50 lg:text-slate-500"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-colors ${isActive ? "text-[#38bdf8] lg:text-sky-600" : "text-slate-500"}`} 
              />
              <span className={`text-[10px] sm:text-xs lg:text-sm font-bold tracking-wide transition-colors ${isActive ? "text-[#38bdf8] lg:text-sky-700" : "text-slate-500"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
