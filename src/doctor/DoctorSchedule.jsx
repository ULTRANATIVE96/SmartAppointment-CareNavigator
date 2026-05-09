import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, Bell } from 'lucide-react';

const STATUS_CONFIG = {
  scheduled: { color: 'bg-primary/10 text-primary', label: 'Scheduled' },
  completed: { color: 'bg-emerald-50 text-emerald-700', label: 'Completed' },
  cancelled: { color: 'bg-rose-50 text-rose-600', label: 'Cancelled' },
  no_show:   { color: 'bg-amber-50 text-amber-600', label: 'No Show' },
};

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

export default function DoctorSchedule() {
  const { user, profile } = useAuth();
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
    setLoading(false);
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
    // Sync badge in AdminLayout
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
      <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md ${compact ? 'p-4' : 'p-5'}`}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <img
            src={appt.profiles?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.profiles?.full_name || 'P')}&background=f1f5f9&color=0f172a&bold=true`}
            className="w-12 h-12 rounded-2xl object-cover shrink-0"
            alt=""
          />

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="font-bold text-slate-800">{appt.profiles?.full_name || 'Patient'}</p>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${st.color}`}>
                {st.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar size={11} /> {appt.appointment_date}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock size={11} /> {appt.appointment_time}
              </p>
            </div>
            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-1.5 mt-1 truncate">
              {appt.reason}
            </p>
          </div>
        </div>

        {/* Status Actions (only on non-completed) */}
        {appt.status === 'scheduled' && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => updateStatus(appt.id, 'completed')}
              disabled={updatingId === appt.id}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all">
              {updatingId === appt.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              Mark Complete
            </button>
            <button
              onClick={() => updateStatus(appt.id, 'no_show')}
              disabled={updatingId === appt.id}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl text-xs font-bold transition-all">
              <AlertCircle size={13} /> No Show
            </button>
            <button
              onClick={() => updateStatus(appt.id, 'cancelled')}
              disabled={updatingId === appt.id}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all">
              <XCircle size={13} /> Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-28">

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Calendar className="text-primary" size={22} /> My Schedule
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Today: {todayFull}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black">
            {todayAppointments.length} Today
          </div>
          <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-black">
            {upcomingAppointments.length} Upcoming
          </div>
          <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black">
            {appointments.filter(a => a.status === 'completed').length} Completed
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        {[
          { key: 'today', label: `Today (${todayAppointments.length})`, icon: Clock },
          { key: 'upcoming', label: `Upcoming (${upcomingAppointments.length})`, icon: Calendar },
          { key: 'past', label: `Past (${pastAppointments.length})`, icon: CheckCircle },
          { key: 'notifications', label: `Alerts (${notifications.filter(n => !n.is_read).length})`, icon: Bell },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center
              ${activeTab === tab.key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      )}

      {/* TODAY */}
      {!loading && activeTab === 'today' && (
        <div className="space-y-4">
          {todayAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
              <Calendar size={32} className="mx-auto text-slate-300" />
              <p className="text-slate-500 font-medium">No appointments scheduled for today.</p>
              <p className="text-slate-400 text-sm">Enjoy your free day!</p>
            </div>
          ) : (
            todayAppointments.map(a => <AppointmentCard key={a.id} appt={a} />)
          )}
        </div>
      )}

      {/* UPCOMING */}
      {!loading && activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-sm">No upcoming appointments.</p>
            </div>
          ) : upcomingAppointments.map(a => <AppointmentCard key={a.id} appt={a} />)}
        </div>
      )}

      {/* PAST */}
      {!loading && activeTab === 'past' && (
        <div className="space-y-4">
          {pastAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-sm">No past appointments yet.</p>
            </div>
          ) : pastAppointments.map(a => <AppointmentCard key={a.id} appt={a} compact />)}
        </div>
      )}

      {/* NOTIFICATIONS / ALERTS */}
      {!loading && activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h2 className="font-bold text-slate-800">Appointment Alerts</h2>
            <p className="text-xs text-slate-500 mt-0.5">New bookings sent to your account</p>
          </div>
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm">No alerts yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map(n => (
                <div key={n.id}
                  onClick={() => !n.is_read && markNotifRead(n.id)}
                  className={`p-5 flex items-start gap-4 transition-all
                    ${n.is_read
                      ? 'opacity-60'
                      : 'cursor-pointer hover:bg-primary/3 bg-white'}`}>
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0"><Calendar size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse"></div>}
                      <p className={`font-bold text-sm ${n.is_read ? 'text-slate-500' : 'text-slate-800'}`}>{n.title}</p>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 whitespace-pre-line leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                      <Clock size={9} /> {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {n.is_read
                    ? <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-1" />
                    : <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2"></div>
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
