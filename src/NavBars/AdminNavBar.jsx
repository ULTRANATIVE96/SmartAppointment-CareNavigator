import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, BarChart3, Settings, User, Calendar } from "lucide-react";

function AdminNavBar() {
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin", end: true },
    { label: "Schedule",  icon: Calendar,        path: "/admin/schedule" },
    { label: "Users",     icon: Users,           path: "/admin/users" },
    { label: "Reports",   icon: BarChart3,       path: "/admin/reports" },
    { label: "Profile",   icon: User,            path: "/admin/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)] lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-fit lg:rounded-2xl lg:border lg:border-slate-200/60 lg:shadow-2xl lg:px-4 lg:py-2 transition-all">
      <div className="flex justify-around items-end px-2 pt-3 pb-6 max-w-2xl mx-auto h-20 lg:h-14 lg:p-0 lg:gap-4 lg:items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-2.5 flex-1 lg:flex-none h-full active:scale-95 transition-all lg:px-5 lg:py-2.5 lg:rounded-xl ${
                isActive
                  ? "lg:bg-slate-900/10 lg:text-slate-900"
                  : "lg:hover:bg-slate-50 lg:text-slate-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors ${isActive ? "text-primary lg:text-slate-900" : "text-slate-500"}`}
                />
                <span className={`text-[10px] sm:text-xs lg:text-sm font-bold tracking-wide transition-colors ${isActive ? "text-primary lg:text-slate-900" : "text-slate-500"}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default AdminNavBar;
