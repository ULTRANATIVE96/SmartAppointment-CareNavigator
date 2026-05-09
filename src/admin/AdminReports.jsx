import { BarChart3, TrendingUp, Clock, Activity } from "lucide-react";

function AdminReports() {
  const stats = [
    { label: "Appointments This Week", value: "45", icon: BarChart3, trend: "+12%", color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Average Wait Time", value: "12 min", icon: Clock, trend: "-2 min", color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Doctor Utilization", value: "78%", icon: Activity, trend: "+5%", color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <TrendingUp className="text-primary" />
          Reports Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">Analyze appointments, patient flow, and doctor workload.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                {stat.trend}
              </span>
            </div>
            <h2 className="text-slate-500 font-semibold mb-1">{stat.label}</h2>
            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>
      
      {/* Placeholder for a chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64 flex items-center justify-center text-slate-400 border-dashed">
        <div className="text-center">
          <BarChart3 size={48} className="mx-auto mb-2 opacity-20" />
          <p>Detailed chart view coming soon</p>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
