import { useState, useEffect } from "react";
import { Users, MoreVertical, Search, Filter, Mail, Shield, User, X, Loader2, CheckCircle2, Lock, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("patient");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) return;
    
    setIsSubmitting(true);
    try {
      // 1. Capture the admin's current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      // 2. Create the real user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserName,
            role: newUserRole,
          }
        }
      });

      if (authError) throw authError;

      // Note: The database trigger handle_new_user() automatically creates the row in the 'profiles' table.

      // 3. If the role is doctor or admin, also add them to the 'doctors' table
      if (newUserRole === 'doctor' || newUserRole === 'admin') {
        if (authData?.user?.id) {
          const { error: docError } = await supabase
            .from('doctors')
            .insert([{
              id: authData.user.id,
              is_available: true,
              rating: 5.0,
              experience_years: 0
            }]);
          if (docError) console.error("Error adding to doctors table:", docError);
        }
      }

      // 4. Restore the admin's session so they aren't logged out
      if (currentSession) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token
        });
      }

      alert("User added successfully!");
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert("Error adding user: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("patient");
  };

  const handleRemoveUser = async (userId, userName) => {
    const pin = window.prompt(`To permanently remove ${userName}, enter the admin PIN:`);
    if (pin !== "10111") {
      if (pin !== null) alert("Incorrect PIN. Deletion cancelled.");
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_user', { target_user_id: userId });
      if (error) throw error;
      
      alert("User removed successfully.");
      fetchUsers();
    } catch (err) {
      alert("Error removing user. Make sure you have run the updated SQL in Supabase. Details: " + err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-primary" size={28} />
            Manage Users
          </h1>
          <p className="text-slate-500 text-sm mt-1">View, add, and manage system users and doctors.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
        >
          <span>+ Add New User</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary/50 focus:bg-white transition-all text-sm"
            />
          </div>
          <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-100 transition-all">
            <Filter size={18} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-slate-400 text-sm font-medium">Loading user data...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Mobile View: Cards */}
            <div className="md:hidden divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-slate-400">No users found</div>
              ) : filteredUsers.map((user) => (
                <div key={user.id} className="p-5 space-y-4 hover:bg-slate-50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=f1f5f9&color=0f172a&bold=true`}
                        className="w-10 h-10 rounded-xl"
                        alt=""
                      />
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{user.full_name}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">{user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveUser(user.id, user.full_name)} className="p-1.5 text-rose-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                      user.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user.role}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-400">No users found</td></tr>
                  ) : filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=f1f5f9&color=0f172a&bold=true`}
                            className="w-10 h-10 rounded-xl"
                            alt=""
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{user.full_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                          user.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          Active
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <button onClick={() => handleRemoveUser(user.id, user.full_name)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl"><User size={20} /></div>
                <h2 className="text-xl font-bold">Add New User</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter user's full name"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary/50 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary/50 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary/50 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">System Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {['patient', 'doctor', 'admin'].map(r => (
                    <button 
                      key={r}
                      type="button"
                      onClick={() => setNewUserRole(r)}
                      className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        newUserRole === r 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {newUserRole === 'doctor' && (
                  <p className="text-[10px] text-primary font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 size={12} /> This user will be bookable by patients.
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirm & Add User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
