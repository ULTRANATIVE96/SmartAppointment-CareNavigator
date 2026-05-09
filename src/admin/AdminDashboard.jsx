import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Calendar as CalendarIcon, AlertTriangle, Briefcase, CalendarOff, CheckCircle2 } from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [overrideDate, setOverrideDate] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCallOff = () => {
    if (!overrideDate) return;
    setSuccessMsg(`Successfully blocked off ${overrideDate}. Patients can no longer book this date.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Briefcase className="text-primary w-8 h-8" />
          Admin Control Center
        </h1>
        <p className="text-slate-500 font-medium mt-2">Manage clinic operations, doctors, and advance schedules.</p>
      </div>

      {/* Doctor Schedule Management (Exclusive to Admin) */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="bg-slate-800 text-white p-5 flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2 text-lg">
            <Settings size={20} />
            Doctor Schedule Management
          </h2>
          <span className="text-xs font-bold bg-rose-500 px-3 py-1 rounded-full text-white tracking-widest uppercase shadow-sm">Admin Access Only</span>
        </div>
        
        <div className="p-6 md:p-8 space-y-6 bg-slate-50/50">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Doctor Details & Rules */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-2xl border-4 border-white shadow-md">
                    DV
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl text-slate-800">Doctor D.Vine</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">Senior Surgeon</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rule Config Box */}
              <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-6 flex gap-4 items-start shadow-sm transition-transform hover:-translate-y-1">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={28} />
                <div>
                  <h4 className="font-black text-amber-900 text-sm mb-3 uppercase tracking-wider">Strict Daily Schedule Rule Active</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-amber-800 font-bold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      Type: <span className="text-amber-900 font-black">Operation (3 Hour Slot)</span>
                    </p>
                    <p className="text-sm text-amber-800 font-bold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      Max Allowance: <span className="text-amber-900 font-black">3 Operations per day</span>
                    </p>
                    <p className="text-sm text-amber-800 font-bold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      Total Capacity: <span className="text-amber-900 font-black">9 Hours Hard Cap</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advance Scheduling Override */}
            <div className="lg:w-1/3 flex flex-col justify-center space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col justify-center relative">
                <h4 className="font-extrabold text-slate-700 text-sm tracking-wide mb-2 flex items-center gap-2 uppercase">
                  <CalendarOff size={16} className="text-rose-500" />
                  Advance Override
                </h4>
                <p className="text-xs text-slate-500 mb-5 font-semibold">
                  Block off future dates (e.g. 6 months from now for planned events) so patients cannot book.
                </p>
                
                <div className="space-y-3">
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date" 
                      value={overrideDate}
                      onChange={(e) => setOverrideDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 text-sm font-bold text-slate-700 transition-all cursor-pointer"
                    />
                  </div>

                  <button 
                    onClick={handleCallOff}
                    disabled={!overrideDate}
                    className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base ${
                      overrideDate 
                        ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-rose-200 hover:shadow-md hover:border-rose-300 active:scale-95" 
                        : "bg-slate-50 text-slate-400 border-2 border-slate-100 cursor-not-allowed"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${overrideDate ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    Call Off Selected Day
                  </button>
                </div>

                {successMsg && (
                  <div className="absolute -bottom-16 left-0 right-0 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold border border-emerald-200 shadow-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    {successMsg}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4 mt-8">System Configurations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Manage All Users", icon: "👥", path: "/admin/users" },
            { label: "System Reports", icon: "📊", path: "/admin/reports" },
            { label: "Global Settings", icon: "⚙️", path: "/admin/settings" },
          ].map((action) => (
            <div 
              key={action.path}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer flex flex-col items-center text-center group active:scale-95"
              onClick={() => navigate(action.path)}
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">{action.icon}</span>
              </div>
              <p className="font-extrabold text-slate-700">{action.label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default AdminDashboard;
