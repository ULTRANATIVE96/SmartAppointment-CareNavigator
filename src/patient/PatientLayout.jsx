import { useState, useEffect, useRef } from "react";
import BottomNav from "../NavBars/BottomNav";
import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import { Bell, ChevronLeft, Stethoscope, X, Mail, Clock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

function PatientLayout() {
  const { profile, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const localAvatar = localStorage.getItem('mock_avatar_url');

  const [unreadCount, setUnreadCount] = useState(0);
  const [popupNotifs, setPopupNotifs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchNotifications();
    }
  }, [user]);

  // Listen for read events dispatched by Profile.jsx
  useEffect(() => {
    const handleUpdate = () => {
      const saved = sessionStorage.getItem('unread_count');
      if (saved !== null) setUnreadCount(parseInt(saved, 10));
    };
    window.addEventListener('unread_updated', handleUpdate);
    return () => window.removeEventListener('unread_updated', handleUpdate);
  }, []);

  const fetchNotifications = async () => {
    // Load locally-tracked read IDs (persistent fallback for Mock Mode)
    const locallyRead = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    // Filter out any IDs the user already dismissed locally
    const trulyUnread = (data || []).filter(n => !locallyRead.includes(n.id));

    setUnreadCount(trulyUnread.length);
    if (trulyUnread.length > 0) {
      setPopupNotifs(trulyUnread.slice(0, 3));
      setShowPopup(true);
    } else {
      setUnreadCount(0);
    }
  };

  const dismissPopup = () => setShowPopup(false);

  const goToInbox = () => {
    setShowPopup(false);
    navigate('/patient/profile');
  };

  // Determine a dynamic title based on the route
  const getTitle = () => {
    switch (location.pathname) {
      case "/patient": return "";
      case "/patient/symptoms": return "Symptom Checker";
      case "/patient/appointment": return "Book Appointment";
      case "/patient/care-journey": return "Care Journey";
      default: return "";
    }
  };

  const isHome = location.pathname === "/patient" || location.pathname === "/patient/";
  const isSymptoms = location.pathname === "/patient/symptoms";

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">

      {/* ── Login Notification Popup ── */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Bell size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-base">New Messages</p>
                  <p className="text-white/60 text-xs">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={dismissPopup} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Notification Previews */}
            <div className="divide-y divide-slate-50">
              {popupNotifs.map((n) => (
                <div key={n.id} className="p-4 flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Mail size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{n.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={9} /> {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-2 bg-slate-50 border-t border-slate-100">
              <button onClick={dismissPopup}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all">
                Dismiss
              </button>
              <button onClick={goToInbox}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-700 transition-all">
                View All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Profile Header */}
      <header className={`bg-white/80 backdrop-blur-xl sticky top-0 z-40 px-4 py-3 md:px-8 md:py-4 transition-all ${isHome ? 'border-none' : 'shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-slate-100'} flex justify-between items-center`}>

        {/* Left Section: Back/Logo & Title */}
        <div className="flex items-center gap-3 md:gap-4">
          {!isHome ? (
            <NavLink
              to="/patient"
              className="p-2 md:p-2.5 bg-slate-50 hover:bg-primary/10 text-slate-500 hover:text-primary rounded-xl transition-all shadow-sm border border-slate-100 flex items-center justify-center group"
              aria-label="Back to Home"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </NavLink>
          ) : (
            <div className="p-2.5 bg-slate-800 text-white rounded-full shadow-md flex items-center justify-center">
              <Stethoscope size={24} />
            </div>
          )}

          {!isHome && (
            <div className="flex flex-col justify-center">
              <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight leading-tight truncate max-w-[150px] sm:max-w-none">{getTitle()}</h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Hello, {profile?.full_name?.split(' ')[0] || 'Patient'}</p>
            </div>
          )}
        </div>

        {/* Right Section: Bell + Avatar */}
        <div className="flex items-center gap-3 md:gap-4">
          <NavLink to="/patient/profile" className="p-2 text-slate-600 hover:text-primary transition-all relative">
            <Bell size={22} className="md:w-6 md:h-6" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/patient/profile">
            <img
              src={localAvatar || profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'Patient'}&background=f1f5f9&color=0f172a&bold=true`}
              alt="Profile"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-sm cursor-pointer hover:border-primary/50 transition-colors object-cover"
            />
          </NavLink>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-h-0 relative ${isSymptoms ? '' : 'pb-24 lg:pb-8'}`}>
        <div className={`mx-auto w-full flex-1 flex flex-col min-h-0 ${isHome ? 'pt-2' : ''} ${isSymptoms ? 'p-0 max-w-full' : 'container p-4 md:p-8 max-w-7xl overflow-y-auto custom-scrollbar'}`}>
          <Outlet />
        </div>
      </main>

      {/* Mobile & Desktop Navigation */}
      <BottomNav />
    </div>
  );
}

export default PatientLayout;