import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon, Clock, User, FileText,
  ChevronLeft, ChevronRight, CheckCircle2, Stethoscope,
  AlertCircle, Loader2, ArrowRight, ArrowLeft
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const TIMES = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00"
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

const MOCK_DOCTORS = [
  { id: 'doc-1', profiles: { full_name: 'Dr. Amara Nkosi' }, specialties: { name: 'Cardiology' }, rating: 4.9, experience_years: 12, is_available: true },
  { id: 'doc-2', profiles: { full_name: 'Dr. Sipho Dlamini' }, specialties: { name: 'Pediatrics' }, rating: 4.7, experience_years: 8, is_available: true },
  { id: 'doc-3', profiles: { full_name: 'Dr. Fatima Osei' }, specialties: { name: 'Neurology' }, rating: 4.8, experience_years: 15, is_available: false },
];

export default function Appointment() {
  const { user, profile } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("book");
  const [mobileStep, setMobileStep] = useState(1); // 1=doctor, 2=date, 3=time, 4=confirm

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  useEffect(() => { fetchDoctors(); if (user) fetchMyAppointments(); }, [user]);

  const fetchDoctors = async () => {
    setLoading(true);
    // Fetch real doctors from the database who are marked as available
    // and ensure they have a profile (inner join)
    const { data, error } = await supabase.from('doctors')
      .select('*, profiles!inner(full_name, avatar_url, role), specialties(name, icon)')
      .eq('is_available', true);
      
    if (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    } else {
      // Further filter to ensure they have doctor or admin role if needed
      const filtered = (data || []).filter(d => 
        d.profiles?.role === 'doctor' || d.profiles?.role === 'admin' || d.profiles?.role === 'superuser'
      );
      setDoctors(filtered);
    }
    setLoading(false);
  };

  const fetchMyAppointments = async () => {
    const { data } = await supabase.from('appointments')
      .select('*, doctors(id, profiles(full_name), specialties(name))')
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: false });
    if (data) setMyAppointments(data);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason.trim()) {
      setError("Please fill in all fields."); return;
    }
    setError(""); setSubmitting(true);
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;

    // 1. Save the appointment
    const { data: apptData, error: apptErr } = await supabase
      .from('appointments')
      .insert([{
        patient_id: user.id,
        doctor_id: selectedDoctor.id,
        appointment_date: dateStr,
        appointment_time: selectedTime,
        reason,
        status: 'scheduled'
      }])
      .select()
      .single();

    if (apptErr) {
      setError(apptErr.message);
      setSubmitting(false);
      return;
    }

    // 2. Notify the doctor — this appears in their schedule/inbox
    const doctorProfileId = selectedDoctor.id; // doctor.id = profiles.id
    await supabase.from('notifications').insert([{
      user_id: doctorProfileId,
      title: `New Appointment — ${dateStr} at ${selectedTime}`,
      message: `${profile?.full_name || 'A patient'} has booked an appointment with you on ${MONTHS[calMonth]} ${selectedDate}, ${calYear} at ${selectedTime}.\n\nReason: ${reason}`,
      type: 'appointment',
      metadata: { appointment_id: apptData?.id, date: dateStr, time: selectedTime }
    }]);

    setSuccess(true);
    fetchMyAppointments();
    setSubmitting(false);
  };


  const reset = () => {
    setSuccess(false); setSelectedDoctor(null); setSelectedDate(null);
    setSelectedTime(null); setReason(''); setMobileStep(1); setError('');
  };

  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const isPast = (d) => new Date(calYear, calMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const prevMonth = () => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); setSelectedDate(null); };
  const nextMonth = () => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); setSelectedDate(null); };

  // ── Success Screen ──
  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center shadow-md">
          <CheckCircle2 size={44} className="text-emerald-500" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl font-black text-slate-800">Appointment Booked!</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your appointment with <strong>{selectedDoctor?.profiles?.full_name}</strong> on&nbsp;
            <strong>{MONTHS[calMonth]} {selectedDate}, {calYear}</strong> at&nbsp;
            <strong>{selectedTime}</strong> is confirmed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button onClick={reset} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-sm text-sm">
            Book Another
          </button>
          <button onClick={() => setActiveTab('history')} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">
            My Appointments
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────
  // Reusable panels
  // ─────────────────────────────────
  const DoctorList = () => (
    <div className="divide-y divide-slate-50">
      {loading ? (
        <div className="p-10 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : doctors.map(doc => (
        <button key={doc.id} disabled={doc.is_available === false}
          onClick={() => { setSelectedDoctor(doc); setMobileStep(2); }}
          className={`w-full text-left p-4 flex items-center gap-3 transition-all
            ${doc.is_available === false ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50'}
            ${selectedDoctor?.id === doc.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
          <img src={doc.profiles?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.profiles?.full_name||'Dr')}&background=0f172a&color=fff&bold=true`}
            className="w-12 h-12 rounded-2xl object-cover shrink-0" alt="" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{doc.profiles?.full_name}</p>
            <p className="text-xs text-slate-500">{doc.specialties?.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-amber-500 font-bold">★ {doc.rating}</span>
              {doc.experience_years && <span className="text-[10px] text-slate-400">{doc.experience_years}y exp</span>}
              {doc.is_available === false && <span className="text-[10px] text-rose-500 font-bold">Unavailable</span>}
            </div>
          </div>
          {selectedDoctor?.id === doc.id ? <CheckCircle2 size={16} className="text-primary shrink-0" /> : <ArrowRight size={16} className="text-slate-300 shrink-0" />}
        </button>
      ))}
    </div>
  );

  const CalendarPicker = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"><ChevronLeft size={18}/></button>
        <span className="font-black text-slate-800 text-base">{MONTHS[calMonth]} {calYear}</span>
        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"><ChevronRight size={18}/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {DAYS.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({length: firstDay}).map((_,i) => <div key={`e${i}`}/>)}
        {Array.from({length: daysInMonth},(_,i)=>i+1).map(d => {
          const past = isPast(d);
          const sel = selectedDate === d;
          return (
            <button key={d} disabled={past} onClick={() => { setSelectedDate(d); setMobileStep(3); }}
              className={`aspect-square rounded-xl text-sm font-bold transition-all
                ${past ? 'text-slate-300 cursor-not-allowed' : ''}
                ${sel ? 'bg-slate-900 text-white shadow-md scale-105' : ''}
                ${!past && !sel ? 'hover:bg-primary/10 hover:text-primary text-slate-700' : ''}`}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );

  const TimePicker = () => (
    <div className="p-4 space-y-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Slots</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {TIMES.map(t => (
          <button key={t} onClick={() => { setSelectedTime(t); setMobileStep(4); }}
            className={`py-3 px-2 rounded-xl text-xs font-bold transition-all
              ${selectedTime === t ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-primary/10 hover:text-primary border border-slate-100'}`}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );

  const BookingForm = () => (
    <div className="p-4 space-y-4">
      {/* Summary */}
      <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl text-xs font-semibold text-primary flex flex-wrap gap-x-4 gap-y-1">
        <span>👨‍⚕️ {selectedDoctor?.profiles?.full_name}</span>
        <span>📅 {MONTHS[calMonth]} {selectedDate}, {calYear}</span>
        <span>⏰ {selectedTime}</span>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Patient Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
          <input readOnly value={profile?.full_name || 'Patient'}
            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-not-allowed" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reason for Visit</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-slate-400" size={15}/>
          <textarea rows="3" placeholder="E.g., routine check-up, consultation…"
            value={reason} onChange={e => setReason(e.target.value)}
            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 resize-none focus:outline-none focus:border-primary transition-all"/>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
          <AlertCircle size={13}/> {error}
        </div>
      )}
      <button onClick={handleBook} disabled={submitting}
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
        {submitting ? <><Loader2 size={15} className="animate-spin"/> Booking…</> : <><CheckCircle2 size={15}/> Confirm Appointment</>}
      </button>
      <p className="text-center text-[10px] text-slate-400">By booking you agree to our cancellation policy.</p>
    </div>
  );

  // Step labels for mobile progress
  const steps = [
    { n: 1, label: "Doctor", icon: Stethoscope },
    { n: 2, label: "Date",   icon: CalendarIcon },
    { n: 3, label: "Time",   icon: Clock },
    { n: 4, label: "Confirm",icon: CheckCircle2 },
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-20 space-y-5">

      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
          <CalendarIcon className="text-primary" size={24}/> Book an Appointment
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Choose a doctor, pick a date and time, and confirm.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <button onClick={() => setActiveTab('book')}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${activeTab==='book' ? 'flex-[1.5] bg-slate-900 text-white shadow-md scale-[1.02]' : 'flex-1 text-slate-500 hover:text-slate-700 bg-slate-50/50 hover:bg-slate-50'}`}>
          <CalendarIcon size={14}/> New Booking
        </button>
        <button onClick={() => setActiveTab('history')}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${activeTab==='history' ? 'flex-[1.5] bg-slate-900 text-white shadow-md scale-[1.02]' : 'flex-1 text-slate-500 hover:text-slate-700 bg-slate-50/50 hover:bg-slate-50'}`}>
          <Clock size={14}/> My Appointments
          {myAppointments.length > 0 && <span className="px-1.5 py-0.5 bg-primary text-white rounded-full text-[9px]">{myAppointments.length}</span>}
        </button>
      </div>

      {/* ══════════════════════════════ BOOKING FLOW ══════════════════════════════ */}
      {activeTab === 'book' && (
        <>
          {/* ── MOBILE: Step Wizard ── */}
          <div className="lg:hidden space-y-4">
            {/* Step Progress Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                {steps.map((s, idx) => (
                  <React.Fragment key={s.n}>
                    <button onClick={() => mobileStep > s.n && setMobileStep(s.n)}
                      className={`flex flex-col items-center gap-1 ${mobileStep >= s.n ? 'text-primary' : 'text-slate-300'} transition-colors`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                        ${mobileStep === s.n ? 'bg-slate-900 text-white shadow-md scale-110' : mobileStep > s.n ? 'bg-primary/15 text-primary' : 'bg-slate-100 text-slate-300'}`}>
                        <s.icon size={16}/>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider">{s.label}</span>
                    </button>
                    {idx < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${mobileStep > s.n ? 'bg-primary' : 'bg-slate-100'}`}/>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-50 flex items-center gap-2">
                {mobileStep > 1 && (
                  <button onClick={() => setMobileStep(s => s - 1)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                    <ArrowLeft size={16} className="text-slate-500"/>
                  </button>
                )}
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">
                    {mobileStep === 1 && 'Choose a Doctor'}
                    {mobileStep === 2 && 'Pick a Date'}
                    {mobileStep === 3 && 'Pick a Time'}
                    {mobileStep === 4 && 'Confirm Booking'}
                  </h2>
                  {selectedDoctor && mobileStep > 1 && (
                    <p className="text-[10px] text-slate-500">{selectedDoctor.profiles?.full_name}</p>
                  )}
                </div>
              </div>

              {mobileStep === 1 && <DoctorList />}
              {mobileStep === 2 && <CalendarPicker />}
              {mobileStep === 3 && <TimePicker />}
              {mobileStep === 4 && <BookingForm />}
            </div>
          </div>

          {/* ── DESKTOP: Side-by-Side 3-Column ── */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {/* Column 1: Doctors */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-50 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg"><Stethoscope size={15} className="text-primary"/></div>
                <h2 className="font-bold text-slate-800 text-sm">Choose Doctor</h2>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[520px]"><DoctorList /></div>
            </div>

            {/* Column 2: Calendar + Time */}
            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg"><CalendarIcon size={15} className="text-primary"/></div>
                  <h2 className="font-bold text-slate-800 text-sm">Pick a Date</h2>
                </div>
                <CalendarPicker />
              </div>

              {selectedDate && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
                  <div className="p-4 border-b border-slate-50 flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg"><Clock size={15} className="text-primary"/></div>
                    <h2 className="font-bold text-slate-800 text-sm">Pick a Time</h2>
                  </div>
                  <TimePicker />
                </div>
              )}
            </div>

            {/* Column 3: Booking Form */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-50 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg"><CheckCircle2 size={15} className="text-primary"/></div>
                <h2 className="font-bold text-slate-800 text-sm">Confirm Booking</h2>
              </div>
              {selectedDoctor && selectedDate && selectedTime ? (
                <BookingForm />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 size={22} className="text-slate-300"/>
                  </div>
                  <p className="text-slate-400 text-sm">Select a doctor, date, and time to continue.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════ HISTORY TAB ══════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h2 className="font-bold text-slate-800">My Appointments</h2>
            <p className="text-xs text-slate-500 mt-0.5">All scheduled and past visits</p>
          </div>
          {myAppointments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <CalendarIcon size={32} className="mx-auto text-slate-300"/>
              <p className="text-slate-400 text-sm">No appointments yet — book your first one!</p>
              <button onClick={() => setActiveTab('book')} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-sm">
                Book Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5 bg-slate-50/30">
              {myAppointments.map(a => {
                const st = {
                  scheduled: { color: 'bg-primary/10 text-primary', iconColor: 'text-primary', label: 'Scheduled' },
                  completed: { color: 'bg-emerald-50 text-emerald-700', iconColor: 'text-emerald-600', label: 'Completed' },
                  cancelled: { color: 'bg-rose-50 text-rose-600', iconColor: 'text-rose-500', label: 'Cancelled' },
                  no_show: { color: 'bg-amber-50 text-amber-600', iconColor: 'text-amber-500', label: 'No Show' }
                }[a.status] || { color: 'bg-slate-100 text-slate-600', iconColor: 'text-slate-500', label: a.status };

                return (
                  <div key={a.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col gap-4">
                    
                    {/* Header: Doctor & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${st.color}`}>
                          <CalendarIcon size={18} className={st.iconColor} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{a.doctors?.profiles?.full_name || 'Doctor'}</p>
                          <p className="text-xs font-medium text-slate-500 truncate">{a.doctors?.specialties?.name}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shrink-0 ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    
                    {/* Date & Time block */}
                    <div className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-slate-400"/>
                        <span className="text-xs font-bold text-slate-700">{a.appointment_date}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400"/>
                        <span className="text-xs font-bold text-slate-700">{a.appointment_time}</span>
                      </div>
                    </div>
                    
                    {/* Reason */}
                    {a.reason && (
                      <div className="px-1">
                        <p className="text-xs text-slate-500 line-clamp-2">
                          <strong className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">Reason:</strong>
                          {a.reason}
                        </p>
                      </div>
                    )}
                    
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
