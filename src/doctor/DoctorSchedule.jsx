import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, Bell, ChevronRight, Activity, CalendarDays } from 'lucide-react';

const STATUS_CONFIG = {
  scheduled: { color: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200/50', label: 'Scheduled' },
  completed: { color: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/50', label: 'Completed' },
  cancelled: { color: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200/50', label: 'Cancelled' },
  no_show:   { color: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200/50', label: 'No Show' },
};

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

// Skeleton Component
const SkeletonCard = () => (
  <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/40 shadow-sm animate-pulse flex items-start gap-4">
    <div className="w-14 h-14 bg-slate-200 rounded-2xl shrink-0"></div>
    <div className="flex-1 space-y-3 py-1">
      <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
      <div className="flex gap-2">
        <div className="h-3 bg-slate-200 rounded-md w-1/4"></div>
        <div className="h-3 bg-slate-200 rounded-md w-1/4"></div>
      </div>
      <div className="h-8 bg-slate-100 rounded-xl w-full mt-2"></div>
    </div>
  </div>
);

export default function DoctorSchedule() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [updatingId, setUpdatingId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFull = (() => {
    const d = new Date();
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  })();

  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*, profiles!appointments_patient_id_fkey(full_name, avatar_url, phone)')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });
    if (data) setAppointments(data);
    
    // Slight delay to showcase the beautiful skeleton loader
    setTimeout(() => setLoading(false), 600);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'appointment')
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const markNotifRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    setNotifications(updated);
    const newUnread = updated.filter(n => !n.is_read).length;
    sessionStorage.setItem('admin_unread_count', String(newUnread));
    window.dispatchEvent(new Event('admin_unread_updated'));
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
    await fetchAppointments();
    setUpdatingId(null);
  };

  const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);
  const upcomingAppointments = appointments.filter(a => a.appointment_date > todayStr);
  const pastAppointments = appointments.filter(a => a.appointment_date < todayStr);

  const AppointmentCard = ({ appt, compact = false }) => {
    const st = STATUS_CONFIG[appt.status] || STATUS_CONFIG.scheduled;
    return (
      <div className={`group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${compact ? 'p-4' : 'p-5'}`}>
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="flex items-start gap-4 relative z-10">
          <div className="relative">
            <img
              src={appt.profiles?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.profiles?.full_name || 'P')}&background=f1f5f9&color=0f172a&bold=true`}
              className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-4 ring-white shadow-sm"
              alt=""
            />
            {appt.status === 'scheduled' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 text-lg tracking-tight">{appt.profiles?.full_name || 'Patient'}</h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shrink-0 tracking-wider shadow-sm ${st.color}`}>
                {st.label}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/80 rounded-lg text-xs font-medium text-slate-600">
                <CalendarDays size={14} className="text-indigo-600" /> {appt.appointment_date}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/80 rounded-lg text-xs font-medium text-slate-600">
                <Clock size={14} className="text-indigo-600" /> {appt.appointment_time}
              </div>
            </div>
            
            <div className="bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2 mt-2">
              <p className="text-xs text-slate-600 line-clamp-2">
                <span className="font-semibold text-slate-700 mr-1">Reason:</span>
                {appt.reason}
              </p>
            </div>
          </div>
        </div>

        {appt.status === 'scheduled' && (
          <div className="flex gap-2 mt-5 relative z-10">
            <button
              onClick={() => updateStatus(appt.id, 'completed')}
              disabled={updatingId === appt.id}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-emerald-200 disabled:opacity-70 disabled:scale-100 active:scale-95 cursor-pointer">
              {updatingId === appt.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Complete
            </button>
            <button
              onClick={() => updateStatus(appt.id, 'no_show')}
              disabled={updatingId === appt.id}
              className="flex items-center justify-center px-4 py-2.5 bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-bold transition-all disabled:opacity-70 active:scale-95 cursor-pointer">
              <AlertCircle size={14} /> No Show
            </button>
            <button
              onClick={() => updateStatus(appt.id, 'cancelled')}
              disabled={updatingId === appt.id}
              className="flex items-center justify-center px-4 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all disabled:opacity-70 active:scale-95 cursor-pointer">
              <XCircle size={14} /> Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 shadow-2xl">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-xs font-medium mb-2 border border-white/10">
              <Activity size={12} className="text-emerald-400" />
              Live Schedule
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              My Schedule
            </h1>
            <p className="text-slate-300 font-medium flex items-center gap-2">
              <CalendarDays size={16} className="text-indigo-300" /> {todayFull}
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl text-center">
              <p className="text-white/60 text-xs font-medium mb-1">Today</p>
              <p className="text-white font-bold text-xl">{todayAppointments.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl text-center">
              <p className="text-white/60 text-xs font-medium mb-1">Upcoming</p>
              <p className="text-white font-bold text-xl">{upcomingAppointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto hide-scrollbar relative z-20">
        {[
          { key: 'today', label: `Today`, count: todayAppointments.length, icon: Clock },
          { key: 'upcoming', label: `Upcoming`, count: upcomingAppointments.length, icon: CalendarDays },
          { key: 'past', label: `Past`, count: pastAppointments.length, icon: CheckCircle },
          { key: 'notifications', label: `Alerts`, count: notifications.filter(n => !n.is_read).length, icon: Bell, alert: true },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 relative cursor-pointer
              ${activeTab === tab.key 
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}>
            <tab.icon size={16} className={activeTab === tab.key ? 'text-indigo-600' : ''} />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.key 
                ? 'bg-slate-100 text-slate-800' 
                : tab.alert && tab.count > 0 
                  ? 'bg-rose-100 text-rose-600' 
                  : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
            {tab.alert && tab.count > 0 && activeTab !== tab.key && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="relative min-h-[300px]">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* TODAY */}
            {activeTab === 'today' && (
              <div className="space-y-4">
                {todayAppointments.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-16 text-center border border-white shadow-sm space-y-4">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CalendarDays size={32} className="text-indigo-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No Appointments Today</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">Your schedule is completely clear for today. Take some time to relax or catch up on paperwork.</p>
                  </div>
                ) : (
                  todayAppointments.map(a => <AppointmentCard key={a.id} appt={a} />)
                )}
              </div>
            )}

            {/* UPCOMING */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-16 text-center border border-white shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Upcoming Appointments</h3>
                    <p className="text-slate-500 font-medium">Your future schedule is currently empty.</p>
                  </div>
                ) : upcomingAppointments.map(a => <AppointmentCard key={a.id} appt={a} />)}
              </div>
            )}

            {/* PAST */}
            {activeTab === 'past' && (
              <div className="space-y-4">
                {pastAppointments.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-16 text-center border border-white shadow-sm">
                    <p className="text-slate-400 font-medium">No past appointments recorded.</p>
                  </div>
                ) : pastAppointments.map(a => <AppointmentCard key={a.id} appt={a} compact />)}
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-white/50 bg-white/40">
                  <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Bell size={18} className="text-indigo-600" /> System Alerts
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Recent booking activity and notifications</p>
                </div>
                {notifications.length === 0 ? (
                  <div className="py-16 text-center">
                    <Bell size={32} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-400 font-medium">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100/50">
                    {notifications.map(n => (
                      <div key={n.id}
                        onClick={() => !n.is_read && markNotifRead(n.id)}
                        className={`p-6 flex items-start gap-5 transition-all group
                          ${n.is_read
                            ? 'opacity-70 bg-transparent'
                            : 'cursor-pointer hover:bg-white/80 bg-white/50 shadow-[inset_4px_0_0_0_rgb(79,70,229)]'}`}>
                        <div className={`p-3 rounded-2xl shrink-0 shadow-sm ${n.is_read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}>
                          <CalendarDays size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            {!n.is_read && <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 animate-pulse"></div>}
                            <p className={`font-bold text-[15px] ${n.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                          </div>
                          <p className="text-slate-500 text-sm mt-1.5 whitespace-pre-line leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                              <Clock size={12} /> {new Date(n.created_at).toLocaleString()}
                            </p>
                            {!n.is_read && (
                              <p className="text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                Mark as read <ChevronRight size={12} />
                              </p>
                            )}
                          </div>
                        </div>
                        {n.is_read && <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-2" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
