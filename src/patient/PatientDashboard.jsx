import { useNavigate } from "react-router-dom";
import { Stethoscope, Calendar, Compass, ArrowRight } from "lucide-react";

function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ========================================= */}
      {/* MOBILE & TABLET LAYOUT (Strictly Unchanged)*/}
      {/* ========================================= */}
      <div className="space-y-8 lg:hidden block">
        
        {/* Header Section */}
        <div className="text-center md:text-left space-y-2 mt-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Welcome back — We're here <br className="hidden md:block"/> to help
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-medium">
            Your health journey, simplified.
          </p>
        </div>

        {/* Grid of Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Symptom Checker */}
          <button 
            className="flex flex-col items-center justify-center p-6 md:p-8 bg-slate-50 hover:bg-white rounded-3xl border-2 border-transparent hover:border-sky-100 hover:shadow-xl hover:shadow-sky-100/50 transition-all group active:scale-95"
            onClick={() => navigate("/patient/symptoms")}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Stethoscope className="text-sky-500 w-8 h-8 md:w-9 md:h-9" strokeWidth={2} />
            </div>
            <span className="font-semibold text-slate-700 text-sm md:text-base text-center">Symptom Checker</span>
          </button>

          {/* Book Appointment */}
          <button 
            className="flex flex-col items-center justify-center p-6 md:p-8 bg-slate-50 hover:bg-white rounded-3xl border-2 border-transparent hover:border-sky-100 hover:shadow-xl hover:shadow-sky-100/50 transition-all group active:scale-95"
            onClick={() => navigate("/patient/appointment")}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="text-sky-500 w-8 h-8 md:w-9 md:h-9" strokeWidth={2} />
            </div>
            <span className="font-semibold text-slate-700 text-sm md:text-base text-center">Book Appointment</span>
          </button>

          {/* Care Journey Tracker */}
          <button 
            className="flex flex-col items-center justify-center p-6 md:p-8 bg-slate-50 hover:bg-white rounded-3xl border-2 border-transparent hover:border-sky-100 hover:shadow-xl hover:shadow-sky-100/50 transition-all group active:scale-95 col-span-2 md:col-span-1"
            onClick={() => navigate("/patient/care-journey")}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Compass className="text-sky-500 w-8 h-8 md:w-9 md:h-9" strokeWidth={2} />
            </div>
            <span className="font-semibold text-slate-700 text-sm md:text-base text-center">Care Journey Tracker</span>
          </button>

        </div>

        {/* Hero Call To Action */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 to-blue-50/30 border border-sky-100/50 p-8 md:p-10 shadow-sm mt-4">
          
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>

          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-sky-500 mb-3 leading-tight tracking-tight">
              Start Your Personalized <br className="hidden sm:block"/> Health Journey
            </h2>
            <p className="text-sky-900/60 font-medium mb-8 text-sm md:text-base leading-relaxed max-w-sm">
              Get recommendations, book appointments, and track your progress all in one place.
            </p>
            
            <button 
              onClick={() => navigate("/patient/care-journey")}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-sky-500/25 transition-all active:scale-95 group"
            >
              Start Your Journey 
              <ArrowRight strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* ========================================= */}
      {/* DESKTOP LAYOUT (Premium Split-Screen UX)  */}
      {/* ========================================= */}
      <div className="hidden lg:grid grid-cols-12 gap-12 min-h-[600px] items-center">
        
        {/* Left Column: Hero & Welcome */}
        <div className="col-span-6 xl:col-span-7 flex flex-col justify-center h-full space-y-10 pr-4">
            <div className="inline-block px-4 py-2 bg-sky-50 border border-sky-100 rounded-full w-fit">
              <span className="text-sm font-bold tracking-widest uppercase text-sky-600">CareJourney Patient Portal</span>
            </div>
            
            <h1 className="text-5xl xl:text-7xl font-black text-slate-800 tracking-tight leading-[1.05]">
              Your health,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">simplified and clear.</span>
            </h1>
            
            <p className="text-slate-500 text-xl font-medium max-w-lg leading-relaxed">
              We're here to help you get the best recommendations, book expert appointments, and navigate your care path effortlessly.
            </p>
            
            <button 
              onClick={() => navigate("/patient/care-journey")}
              className="w-fit flex items-center justify-center gap-4 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 group"
            >
              Start Your Journey 
              <ArrowRight strokeWidth={3} className="group-hover:translate-x-2 transition-transform w-6 h-6" />
            </button>

            {/* Trust Badge */}
            <div className="pt-8 flex items-center gap-6 mt-4">
                <div className="flex -space-x-4">
                    <img className="w-14 h-14 rounded-full border-4 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80" alt="Doctor" />
                    <img className="w-14 h-14 rounded-full border-4 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80" alt="Doctor" />
                    <img className="w-14 h-14 rounded-full border-4 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1594824432258-2eb75b0851f8?auto=format&fit=crop&w=100&q=80" alt="Doctor" />
                </div>
                <p className="text-sm font-bold text-slate-400 leading-tight">
                  <span className="text-slate-700 text-xl">4.9/5</span><br/>
                  Patient Satisfaction
                </p>
            </div>
        </div>

        {/* Right Column: Premium Action Bento Box */}
        <div className="col-span-6 xl:col-span-5 grid grid-cols-1 gap-6 h-full py-6">
            
            <div 
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-sky-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex items-center gap-6"
              onClick={() => navigate("/patient/appointment")}
            >
              <div className="w-24 h-24 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0 group-hover:bg-sky-500 transition-colors duration-300">
                <Calendar className="text-sky-500 w-12 h-12 group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-sky-600 transition-colors">Book Appointment</h3>
                <p className="text-slate-500 font-medium">Schedule a visit with our leading specialists.</p>
              </div>
            </div>

            <div 
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-emerald-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex items-center gap-6"
              onClick={() => navigate("/patient/symptoms")}
            >
              <div className="w-24 h-24 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 transition-colors duration-300">
                <Stethoscope className="text-emerald-500 w-12 h-12 group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">Symptom Checker</h3>
                <p className="text-slate-500 font-medium">Assess your symptoms online instantly.</p>
              </div>
            </div>

            <div 
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex items-center gap-6"
              onClick={() => navigate("/patient/care-journey")}
            >
              <div className="w-24 h-24 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors duration-300">
                <Compass className="text-indigo-500 w-12 h-12 group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">Care Journey Map</h3>
                <p className="text-slate-500 font-medium">Navigate the facility with step-by-step guidance.</p>
              </div>
            </div>

        </div>
      </div>

    </div>
  );
}

export default PatientDashboard;
