import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Camera, Mail, Clock, Send, Users, User, Bell, Check, AlertCircle, Shield, Radio, X } from 'lucide-react';

function AdminProfile() {
  const { user, profile, signOut } = useAuth();
  const [patients, setPatients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'inbox'
  const [localAvatar, setLocalAvatar] = useState(() => localStorage.getItem('mock_avatar_url') || null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchSentNotifications();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'patient');
    if (data) setPatients(data);
  };

  const fetchSentNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*, profiles!notifications_user_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgTitle || !msgBody) return;
    setIsSending(true);

    // Mock users don't exist in the DB profiles table, so omit sender_id
    const isMockUser = user?.id === '00000000-0000-0000-0000-000000000001';
    const senderField = isMockUser ? {} : { sender_id: user.id };

    try {
      if (selectedPatient === 'all') {
        const inserts = patients.map(p => ({
          user_id: p.id,
          ...senderField,
          title: msgTitle,
          message: msgBody,
          type: 'message'
        }));
        const { error } = await supabase.from('notifications').insert(inserts);
        if (error) throw error;
        alert(`Broadcast sent to ${patients.length} patients!`);
      } else {
        const { error } = await supabase.from('notifications').insert([{
          user_id: selectedPatient,
          ...senderField,
          title: msgTitle,
          message: msgBody,
          type: 'message'
        }]);
        if (error) throw error;
        alert('Message sent successfully!');
      }
      setMsgTitle('');
      setMsgBody('');
      setSelectedPatient('all');
      fetchSentNotifications();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const isMockUser = user?.id === '00000000-0000-0000-0000-000000000001';
    if (isMockUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('mock_avatar_url', reader.result);
        setLocalAvatar(reader.result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    }
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      alert('Profile picture updated!');
      window.location.reload();
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const avatarSrc = localAvatar || profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${profile?.full_name || 'Admin'}&background=0f766e&color=fff&bold=true`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-28">

      {/* Avatar Full Screen Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setShowAvatarModal(false)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors" onClick={() => setShowAvatarModal(false)}>
            <X size={32} />
          </button>
          <img 
            src={avatarSrc}
            alt="Profile Full" 
            className="w-full max-w-sm md:max-w-lg aspect-square object-cover rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Admin Profile Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <img src={avatarSrc} alt="Admin Profile"
              onClick={() => setShowAvatarModal(true)}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-white/20 shadow-2xl group-hover:opacity-90 transition-all cursor-pointer hover:scale-105" />
            <label className="absolute -bottom-2 -right-2 w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white/20">
              {uploading
                ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                : <Camera size={16} />}
              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={handleUpload} />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl font-black tracking-tight">{profile?.full_name || 'Administrator'}</h1>
              <span className="px-3 py-1 bg-primary/30 text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/40 flex items-center gap-1">
                <Shield size={10} /> {profile?.role || 'admin'}
              </span>
            </div>
            <p className="text-white/60 flex items-center justify-center md:justify-start gap-2 text-sm">
              <Mail size={14} /> {user?.email}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Users size={12} /> {patients.length} Patients
              </div>
              <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Bell size={12} /> {notifications.length} Messages Sent
              </div>
              <button onClick={signOut}
                className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5">
                <AlertCircle size={12} /> Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Row */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'messages' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Send size={16} /> Send Message
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'inbox' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Bell size={16} /> Sent History
          {notifications.length > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white rounded-full text-[10px]">{notifications.length}</span>
          )}
        </button>
      </div>

      {/* SEND MESSAGE PANEL */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compose */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl"><Send size={18} /></div>
              <div>
                <h2 className="font-bold text-slate-800">Compose Message</h2>
                <p className="text-xs text-slate-500">Send to one or all patients</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              {/* Recipient Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                  <button type="button"
                    onClick={() => setSelectedPatient('all')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedPatient === 'all' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}>
                    <Radio size={14} /> All Patients
                  </button>
                  <button type="button"
                    onClick={() => setSelectedPatient('')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedPatient !== 'all' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}>
                    <User size={14} /> Specific
                  </button>
                </div>

                {selectedPatient !== 'all' && (
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary/50 text-slate-700 text-sm"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}>
                    <option value="">Select a patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Recipient Preview Badge */}
              <div className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${selectedPatient === 'all' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-primary/5 text-primary border border-primary/10'}`}>
                {selectedPatient === 'all'
                  ? <><Radio size={12} /> Broadcasting to ALL {patients.length} patients</>
                  : <><User size={12} /> {patients.find(p => p.id === selectedPatient)?.full_name || 'No patient selected'}</>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject / Title</label>
                <input type="text" placeholder="e.g. Appointment Reminder"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 text-sm transition-all"
                  value={msgTitle} onChange={(e) => setMsgTitle(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message</label>
                <textarea rows="5" placeholder="Type your message here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 text-sm transition-all resize-none"
                  value={msgBody} onChange={(e) => setMsgBody(e.target.value)}>
                </textarea>
              </div>

              <button type="submit"
                disabled={isSending || (!msgTitle || !msgBody || (selectedPatient !== 'all' && !selectedPatient))}
                className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                {isSending ? 'Sending...' : selectedPatient === 'all' ? `Broadcast to All ${patients.length} Patients` : 'Send Message'}
                {!isSending && <Send size={16} />}
              </button>
            </form>
          </div>

          {/* Patient List Preview */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Users size={18} className="text-primary" /></div>
              <div>
                <h2 className="font-bold text-slate-800">Registered Patients</h2>
                <p className="text-xs text-slate-500">{patients.length} accounts</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[420px] divide-y divide-slate-50">
              {patients.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">No patients yet</div>
              ) : patients.map(p => (
                <div key={p.id}
                  onClick={() => setSelectedPatient(p.id)}
                  className={`flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-all ${selectedPatient === p.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
                  <img src={`https://ui-avatars.com/api/?name=${p.full_name}&background=f1f5f9&color=0f172a&bold=true`}
                    className="w-10 h-10 rounded-full" alt={p.full_name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{p.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.id}</p>
                  </div>
                  {selectedPatient === p.id && <Check size={16} className="text-primary shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SENT HISTORY PANEL */}
      {activeTab === 'inbox' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h2 className="font-bold text-slate-800">Message History</h2>
            <p className="text-xs text-slate-500 mt-0.5">All messages sent from this account</p>
          </div>
          <div className="divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm space-y-3">
                <Bell size={32} className="mx-auto opacity-30" />
                <p>No messages sent yet</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-all">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0"><Send size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-800 text-sm">{n.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${n.is_read ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {n.is_read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <User size={10} /> To: {n.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} /> {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;
