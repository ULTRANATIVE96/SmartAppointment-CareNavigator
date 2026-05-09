import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { User, Bell, Mail, Send, Camera, Check, Clock, AlertCircle, X } from 'lucide-react';

function Profile() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState(() => {
    return localStorage.getItem('mock_avatar_url') || null;
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
    if (isAdmin) fetchPatients();
  }, [user, isAdmin]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setNotifications(data);
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient');
    
    if (data) setPatients(data);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !msgTitle || !msgBody) return;

    setIsSending(true);
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: selectedPatient,
          sender_id: user.id,
          title: msgTitle,
          message: msgBody,
          type: 'message'
        }
      ]);

    if (!error) {
      alert('Message sent successfully!');
      setMsgTitle('');
      setMsgBody('');
      setSelectedPatient('');
    } else {
      alert('Error sending message: ' + error.message);
    }
    setIsSending(false);
  };

  const handleUpload = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];

      // In Mock Mode: show a local preview and persist to localStorage
      const isMockUser = user?.id === '00000000-0000-0000-0000-000000000001';
      if (isMockUser) {
        const localUrl = URL.createObjectURL(file);
        // Save to localStorage as a base64 string for persistence
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result;
          localStorage.setItem('mock_avatar_url', base64);
          setLocalAvatar(base64);
          setUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      alert('Profile picture updated!');
      window.location.reload();
    } catch (error) {
      alert('Error uploading: ' + error.message);
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const markAsRead = async (id) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    // Update local state immediately for instant UI feedback
    const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    setNotifications(updated);

    // Persist to localStorage so popup never re-triggers for this message
    const existing = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
    if (!existing.includes(id)) {
      localStorage.setItem('read_notif_ids', JSON.stringify([...existing, id]));
    }

    // Sync unread count to sessionStorage so the bell badge updates
    const newUnread = updated.filter(n => !n.is_read).length;
    sessionStorage.setItem('unread_count', String(newUnread));
    window.dispatchEvent(new Event('unread_updated'));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Avatar Full Screen Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setShowAvatarModal(false)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors" onClick={() => setShowAvatarModal(false)}>
            <X size={32} />
          </button>
          <img 
            src={localAvatar || profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=0f172a&color=fff&bold=true`}
            alt="Profile Full" 
            className="w-full max-w-sm md:max-w-lg aspect-square object-cover rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative group">
          <img 
            src={localAvatar || profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=0f172a&color=fff&bold=true`}
            alt="Profile" 
            onClick={() => setShowAvatarModal(true)}
            className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl group-hover:opacity-90 transition-all cursor-pointer hover:scale-105"
          />
          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border-4 border-white">
            {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Camera size={18} />}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              disabled={uploading} 
              onChange={handleUpload}
            />
          </label>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{profile?.full_name}</h1>
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
              {profile?.role}
            </span>
          </div>
          <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
            <Mail size={16} /> {user?.email}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 flex items-center gap-2">
              <Clock size={14} /> Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
            </div>
            <button 
              onClick={signOut}
              className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
            >
              <AlertCircle size={14} /> Log Out
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Notifications Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                <Bell size={20} />
              </div>
              <h2 className="font-bold text-slate-800">Inbox & Notifications</h2>
            </div>
            <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {notifications.filter(n => !n.is_read).length} New
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-3 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Bell size={24} />
                </div>
                <p className="text-slate-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all
                    ${n.is_read 
                      ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                      : 'bg-white border-primary/20 shadow-sm ring-1 ring-primary/5 cursor-pointer hover:bg-primary/3 hover:border-primary/40'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse"></div>}
                        <h3 className={`font-bold text-sm ${n.is_read ? 'text-slate-500' : 'text-slate-800'}`}>{n.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                        <Clock size={10} /> {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    {n.is_read 
                      ? <Check size={14} className="text-emerald-400 shrink-0 mt-1" />
                      : <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0"><Check size={14} /></div>
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admin Tools: Send Notification */}
        {isAdmin ? (
          <div className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white space-y-6 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16"></div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Send size={20} className="text-primary-foreground" />
              </div>
              <h2 className="font-bold text-xl">Broadcast to Patient</h2>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Recipient</label>
                <select 
                  className="w-full bg-white/10 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-all text-white appearance-none"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="" className="text-slate-800">Select a patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="text-slate-800">{p.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title / Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Appointment Update"
                  className="w-full bg-white/10 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-all text-white"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                <textarea 
                  rows="4"
                  placeholder="Type your message here..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-all text-white resize-none"
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSending || !selectedPatient}
                className="w-full bg-primary text-white p-4 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send Message Now'}
                {!isSending && <Send size={18} />}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-primary/5 rounded-3xl p-8 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary">
                <AlertCircle size={32} />
             </div>
             <div className="space-y-2">
               <h2 className="font-bold text-slate-800">Need Help?</h2>
               <p className="text-sm text-slate-500 max-w-[250px]">If you have questions about your medical records, please message your doctor through the main portal.</p>
             </div>
             <button className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:scale-105 transition-all">
                Contact Support
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
