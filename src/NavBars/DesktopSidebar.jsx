import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

function DesktopSidebar({ items, title, footer }) {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="text-xl">🩺</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              }`
            }
          >
            <item.icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {footer && (
        <div className="mt-auto pt-4 border-t border-slate-100">
           <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group">
            <LogOut size={20} className="transition-transform group-hover:translate-x-1" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}

export default DesktopSidebar;
