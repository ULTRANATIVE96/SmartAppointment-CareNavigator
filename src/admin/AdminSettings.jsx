import { Settings, Save, Moon, Bell } from "lucide-react";

function AdminSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="text-primary" />
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Configure system preferences and admin options.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <Moon size={16} /> Appearance
            </h2>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">System Theme</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary/50 focus:bg-white transition-colors text-slate-700 font-medium appearance-none">
                <option>Light Mode</option>
                <option>Dark Mode</option>
                <option>System Default</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <Bell size={16} /> Notifications
            </h2>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Notification Email</label>
              <input 
                type="email" 
                placeholder="admin@example.com" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary/50 focus:bg-white transition-colors text-slate-700"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button 
              type="button" 
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-sm w-full sm:w-auto justify-center group"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminSettings;
