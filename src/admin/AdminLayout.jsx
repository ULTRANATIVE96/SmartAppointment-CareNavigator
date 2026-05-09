import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import AdminNavBar from "../NavBars/AdminNavBar";
import { Bell, ChevronLeft, Home } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

function AdminLayout() {
  const { profile, user } = useAuth();
  const location = useLocation();
  const localAvatar = localStorage.getItem('mock_avatar_url');
  const [unreadCount, setUnreadCount] = useState(0);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchUnread();
    }
  }, [user]);

  // Listen for read events dispatched by DoctorSchedule or AdminProfile
  useEffect(() => {
    const handleUpdate = () => {
      const saved = sessionStorage.getItem('admin_unread_count');
      if (saved !== null) setUnreadCount(parseInt(saved, 10));
    };
    window.addEventListener('admin_unread_updated', handleUpdate);
    return () => window.removeEventListener('admin_unread_updated', handleUpdate);
  }, []);

  const fetchUnread = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('id')
      .eq('is_read', false);
    if (data) setUnreadCount(data.length);
  };

  const getTitle = () => {
    switch (location.pathname) {
      case "/admin": return "Admin Control Center";
      case "/admin/users": return "User Management";
      case "/admin/reports": return "System Reports";
      case "/admin/settings": return "System Settings";
      case "/admin/schedule": return "My Schedule";
      case "/admin/profile": return "My Profile";
      default: return "Admin Portal";
    }
  };

  const isHome = location.pathname === "/admin" || location.pathname === "/admin/";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Global Profile Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 px-4 py-3 md:px-8 md:py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-slate-100 flex justify-between items-center transition-all">

        {/* Left Section */}
        <div className="flex items-center gap-3 md:gap-4">
          {!isHome && (
            <NavLink
              to="/admin"
              className="p-2 md:p-2.5 bg-slate-50 hover:bg-primary/10 text-slate-500 hover:text-primary rounded-xl transition-all shadow-sm border border-slate-100 flex items-center justify-center group"
              aria-label="Back to Dashboard"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </NavLink>
          )}
          {isHome && (
            <div className="p-2 md:p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/20 flex items-center justify-center">
              <Home size={20} />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight leading-tight truncate max-w-[150px] sm:max-w-none">{getTitle()}</h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{profile?.full_name || 'System Admin'}</p>
          </div>
        </div>

        {/* Right Section: Bell + Avatar */}
        <div className="flex items-center gap-2 md:gap-4">
          <NavLink to="/admin/schedule" className="p-2 md:p-2.5 text-slate-400 hover:text-primary bg-slate-50 hover:bg-primary/10 border border-slate-100 rounded-full transition-all relative shadow-sm">
            <Bell size={18} className="md:w-5 md:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/profile">
            <img
              src={localAvatar || profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'Admin'}&background=0f766e&color=fff&bold=true`}
              alt="Admin Profile"
              className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-slate-100 shadow-sm cursor-pointer hover:border-primary/50 transition-colors object-cover"
            />
          </NavLink>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col pb-28">
        <div className="container mx-auto p-4 md:p-8 max-w-5xl w-full">
          <Outlet />
        </div>
      </main>

      <AdminNavBar />
    </div>
  );
}

export default AdminLayout;
