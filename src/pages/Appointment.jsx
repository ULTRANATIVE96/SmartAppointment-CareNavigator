import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon, Clock, User, FileText,
  ChevronLeft, ChevronRight, CheckCircle2, Stethoscope,
  AlertCircle, Loader2, ArrowRight, ArrowLeft
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const TIMES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MOCK_DOCTORS = [
  { id: "doc-1", profiles: { full_name: "Dr. Amara Nkosi" }, specialties: { name: "Cardiology" }, rating: 4.9, experience_years: 12, is_available: true },
  { id: "doc-2", profiles: { full_name: "Dr. Sipho Dlamini" }, specialties: { name: "Pediatrics" }, rating: 4.7, experience_years: 8, is_available: true },
  { id: "doc-3", profiles: { full_name: "Dr. Fatima Osei" }, specialties: { name: "Neurology" }, rating: 4.8, experience_years: 15, is_available: false },
];

const STEPS = [
  { n: 1, label: "Doctor", icon: Stethoscope },
  { n: 2, label: "Date", icon: CalendarIcon },
  { n: 3, label: "Time", icon: Clock },
  { n: 4, label: "Confirm", icon: CheckCircle2 },
];

function DoctorList({ loading, doctors, selectedDoctor, onSelect }) {
  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="p-8 text-center space-y-2">
        <Stethoscope size={28} className="mx-auto text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">No doctors available right now.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {doctors.map((doc) => {
        const isSelected = selectedDoctor?.id === doc.id;
        const isUnavailable = doc.is_available === false;
        return (
          <button
            key={doc.id}
            type="button"
            disabled={isUnavailable}
            onClick={() => onSelect(doc)}
            className={`w-full text-left p-3.5 sm:p-4 flex items-center gap-3 transition-all
              ${isUnavailable ? "opacity-45 cursor-not-allowed" : "hover:bg-slate-50 cursor-pointer"}
              ${isSelected ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"}`}
          >
            <img
              src={
                doc.profiles?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.profiles?.full_name || "Dr")}&background=0f172a&color=fff&bold=true`
              }
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover shrink-0"
              alt={doc.profiles?.full_name || "Doctor"}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{doc.profiles?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{doc.specialties?.name}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                {doc.rating && <span className="text-[11px] text-amber-500 font-bold">★ {doc.rating}</span>}
                {doc.experience_years && <span className="text-[11px] text-slate-400">{doc.experience_years}y exp</span>}
                {isUnavailable && <span className="text-[11px] text-rose-500 font-bold">Unavailable</span>}
              </div>
            </div>
            {isSelected ? (
              <CheckCircle2 size={18} className="text-primary shrink-0" />
            ) : (
              <ArrowRight size={16} className="text-slate-300 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function CalendarPicker({ calYear, calMonth, selectedDate, onPrevMonth, onNextMonth, onSelectDate, isPast }) {
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-md mx-auto lg:max-w-none">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Previous month"
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all shrink-0"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-black text-slate-800 text-sm sm:text-base text-center truncate">
          {MONTHS[calMonth]} {calYear}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Next month"
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all shrink-0"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
        {DAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const past = isPast(d);
          const sel = selectedDate === d;
          return (
            <button
              key={d}
              type="button"
              disabled={past}
              onClick={() => onSelectDate(d)}
              className={`h-10 sm:h-11 lg:h-10 w-full rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all
                ${past ? "text-slate-300 cursor-not-allowed" : "cursor-pointer"}
                ${sel ? "bg-slate-900 text-white shadow-md" : ""}
                ${!past && !sel ? "hover:bg-primary/10 hover:text-primary text-slate-700" : ""}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimePicker({ selectedTime, onSelectTime }) {
  return (
    <div className="p-4 sm:p-5 space-y-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Slots</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
        {TIMES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onSelectTime(t)}
            className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer
              ${selectedTime === t
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-primary/10 hover:text-primary border border-slate-100"
              }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingForm({
  selectedDoctor,
  calMonth,
  selectedDate,
  calYear,
  selectedTime,
  profile,
  reason,
  onReasonChange,
  error,
  submitting,
  onBook,
}) {
  return (
    <div className="p-4 sm:p-5 space-y-4">
      <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl text-xs font-semibold text-primary flex flex-wrap gap-x-4 gap-y-1.5">
        <span className="truncate max-w-full">👨‍⚕️ {selectedDoctor?.profiles?.full_name}</span>
        <span>📅 {MONTHS[calMonth]} {selectedDate}, {calYear}</span>
        <span>⏰ {selectedTime}</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Patient Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            readOnly
            value={profile?.full_name || "Patient"}
            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reason for Visit</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3.5 text-slate-400" size={15} />
          <textarea
            rows="3"
            placeholder="E.g., routine check-up, consultation…"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 resize-none focus:outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onBook}
        disabled={submitting}
        className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer"
      >
        {submitting ? (
          <><Loader2 size={15} className="animate-spin" /> Booking…</>
        ) : (
          <><CheckCircle2 size={15} /> Confirm Appointment</>
        )}
      </button>
      <p className="text-center text-[11px] text-slate-400">By booking you agree to our cancellation policy.</p>
    </div>
  );
}

export default function Appointment() {
  const { user, profile } = useAuth();
  const [doctors, setDoctors] = useState(() => (isSupabaseConfigured ? [] : MOCK_DOCTORS));
  const [myAppointments, setMyAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("book");
  const [mobileStep, setMobileStep] = useState(1); // 1=doctor, 2=date, 3=time, 4=confirm

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const fetchMyAppointments = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return;
    const { data } = await supabase
      .from("appointments")
      .select("*, doctors(id, profiles(full_name), specialties(name))")
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: false });
    if (data) setMyAppointments(data);
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    const loadData = async () => {
      const { data, error: fetchError } = await supabase
        .from("doctors")
        .select("*, profiles!inner(full_name, avatar_url, role), specialties(name, icon)")
        .eq("is_available", true);

      if (!cancelled) {
        if (fetchError) {
          console.error("Error fetching doctors:", fetchError);
          setDoctors([]);
        } else {
          const filtered = (data || []).filter(
            (d) =>
              d.profiles?.role === "doctor" ||
              d.profiles?.role === "admin" ||
              d.profiles?.role === "superuser"
          );
          setDoctors(filtered);
        }
        setLoading(false);
      }

      if (user) {
        await fetchMyAppointments();
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [user, fetchMyAppointments]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;

    if (!isSupabaseConfigured) {
      const mockAppt = {
        id: `mock-${Date.now()}`,
        appointment_date: dateStr,
        appointment_time: selectedTime,
        reason,
        status: "scheduled",
        doctors: {
          id: selectedDoctor.id,
          profiles: { full_name: selectedDoctor.profiles?.full_name },
          specialties: { name: selectedDoctor.specialties?.name },
        },
      };
      setMyAppointments((prev) => [mockAppt, ...prev]);
      setSuccess(true);
      setSubmitting(false);
      return;
    }

    const { data: apptData, error: apptErr } = await supabase
      .from("appointments")
      .insert([{
        patient_id: user.id,
        doctor_id: selectedDoctor.id,
        appointment_date: dateStr,
        appointment_time: selectedTime,
        reason,
        status: "scheduled",
      }])
      .select()
      .single();

    if (apptErr) {
      setError(apptErr.message);
      setSubmitting(false);
      return;
    }

    const doctorProfileId = selectedDoctor.id;
    await supabase.from("notifications").insert([{
      user_id: doctorProfileId,
      title: `New Appointment — ${dateStr} at ${selectedTime}`,
      message: `${profile?.full_name || "A patient"} has booked an appointment with you on ${MONTHS[calMonth]} ${selectedDate}, ${calYear} at ${selectedTime}.\n\nReason: ${reason}`,
      type: "appointment",
      metadata: { appointment_id: apptData?.id, date: dateStr, time: selectedTime },
    }]);

    setSuccess(true);
    fetchMyAppointments();
    setSubmitting(false);
  };

  const reset = () => {
    setSuccess(false);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setReason("");
    setMobileStep(1);
    setError("");
  };

  const isPast = (d) =>
    new Date(calYear, calMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setMobileStep(2);
  };

  const handleSelectDate = (d) => {
    setSelectedDate(d);
    setMobileStep(3);
  };

  const handleSelectTime = (t) => {
    setSelectedTime(t);
    setMobileStep(4);
  };

  const canJumpToStep = (stepNum) => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return Boolean(selectedDoctor);
    if (stepNum === 3) return Boolean(selectedDoctor && selectedDate);
    if (stepNum === 4) return Boolean(selectedDoctor && selectedDate && selectedTime);
    return false;
  };

  // ── Success Screen ──
  if (success) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-3xl flex items-center justify-center shadow-md">
          <CheckCircle2 size={42} className="text-emerald-500" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">Appointment Booked!</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your appointment with <strong>{selectedDoctor?.profiles?.full_name}</strong> on{" "}
            <strong>{MONTHS[calMonth]} {selectedDate}, {calYear}</strong> at{" "}
            <strong>{selectedTime}</strong> is confirmed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={reset}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-sm text-sm"
          >
            Book Another
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setActiveTab("history");
            }}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
          >
            My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 max-w-6xl mx-auto pb-24 space-y-5">
      {/* Page Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <CalendarIcon className="text-primary shrink-0" size={24} />
            <span className="truncate">Book an Appointment</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Choose a doctor, pick a date and time, and confirm.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto sm:min-w-[300px] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("book")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === "book"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
          >
            <CalendarIcon size={14} className="shrink-0" />
            <span>New Booking</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === "history"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
          >
            <Clock size={14} className="shrink-0" />
            <span>My Appointments</span>
            {myAppointments.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary text-white rounded-full text-[10px] leading-none">
                {myAppointments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════ BOOKING FLOW ══════════════════════════════ */}
      {activeTab === "book" && (
        <>
          {/* ── MOBILE & TABLET (< 1024px): Step Wizard ── */}
          <div className="lg:hidden space-y-4">
            {/* Step Progress Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-3.5 sm:p-4">
              <div className="flex items-center justify-between">
                {STEPS.map((s, idx) => {
                  const unlocked = canJumpToStep(s.n);
                  const active = mobileStep === s.n;
                  const completed = mobileStep > s.n;
                  return (
                    <React.Fragment key={s.n}>
                      <button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => unlocked && setMobileStep(s.n)}
                        className={`flex flex-col items-center gap-1 min-w-0 transition-colors ${active || completed ? "text-primary" : "text-slate-300"
                          } ${unlocked ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all ${active
                              ? "bg-slate-900 text-white shadow-md scale-105"
                              : completed
                                ? "bg-primary/15 text-primary"
                                : "bg-slate-100 text-slate-300"
                            }`}
                        >
                          <s.icon size={15} />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider truncate">
                          {s.label}
                        </span>
                      </button>
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-all ${completed ? "bg-primary" : "bg-slate-100"
                            }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Step Content Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2.5">
                {mobileStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setMobileStep((s) => s - 1)}
                    aria-label="Previous step"
                    className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all shrink-0"
                  >
                    <ArrowLeft size={16} className="text-slate-500" />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                    {mobileStep === 1 && "Choose a Doctor"}
                    {mobileStep === 2 && "Pick a Date"}
                    {mobileStep === 3 && "Pick a Time"}
                    {mobileStep === 4 && "Confirm Booking"}
                  </h2>
                  {selectedDoctor && mobileStep > 1 && (
                    <p className="text-xs text-slate-500 truncate">
                      {selectedDoctor.profiles?.full_name}
                      {selectedDate && mobileStep > 2 ? ` • ${MONTHS[calMonth]} ${selectedDate}` : ""}
                      {selectedTime && mobileStep > 3 ? ` • ${selectedTime}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {mobileStep === 1 && (
                <DoctorList
                  loading={loading}
                  doctors={doctors}
                  selectedDoctor={selectedDoctor}
                  onSelect={handleSelectDoctor}
                />
              )}
              {mobileStep === 2 && (
                <CalendarPicker
                  calYear={calYear}
                  calMonth={calMonth}
                  selectedDate={selectedDate}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                  onSelectDate={handleSelectDate}
                  isPast={isPast}
                />
              )}
              {mobileStep === 3 && (
                <TimePicker selectedTime={selectedTime} onSelectTime={handleSelectTime} />
              )}
              {mobileStep === 4 && (
                <BookingForm
                  selectedDoctor={selectedDoctor}
                  calMonth={calMonth}
                  selectedDate={selectedDate}
                  calYear={calYear}
                  selectedTime={selectedTime}
                  profile={profile}
                  reason={reason}
                  onReasonChange={setReason}
                  error={error}
                  submitting={submitting}
                  onBook={handleBook}
                />
              )}
            </div>
          </div>

          {/* ── DESKTOP (lg: 2-col + full-width confirm, xl: 3-col side-by-side) ── */}
          <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6 items-start">
            {/* Column 1: Doctors */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-w-0">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                  <Stethoscope size={15} className="text-primary" />
                </div>
                <h2 className="font-bold text-slate-800 text-sm">1. Choose Doctor</h2>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[540px]">
                <DoctorList
                  loading={loading}
                  doctors={doctors}
                  selectedDoctor={selectedDoctor}
                  onSelect={handleSelectDoctor}
                />
              </div>
            </div>

            {/* Column 2: Calendar + Time */}
            <div className="space-y-5 min-w-0">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                    <CalendarIcon size={15} className="text-primary" />
                  </div>
                  <h2 className="font-bold text-slate-800 text-sm">2. Pick a Date</h2>
                </div>
                <CalendarPicker
                  calYear={calYear}
                  calMonth={calMonth}
                  selectedDate={selectedDate}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                  onSelectDate={handleSelectDate}
                  isPast={isPast}
                />
              </div>

              {selectedDate && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
                  <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                      <Clock size={15} className="text-primary" />
                    </div>
                    <h2 className="font-bold text-slate-800 text-sm">3. Pick a Time</h2>
                  </div>
                  <TimePicker selectedTime={selectedTime} onSelectTime={handleSelectTime} />
                </div>
              )}
            </div>

            {/* Column 3: Booking Form */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-w-0 lg:col-span-2 xl:col-span-1">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                  <CheckCircle2 size={15} className="text-primary" />
                </div>
                <h2 className="font-bold text-slate-800 text-sm">4. Confirm Booking</h2>
              </div>
              {selectedDoctor && selectedDate && selectedTime ? (
                <BookingForm
                  selectedDoctor={selectedDoctor}
                  calMonth={calMonth}
                  selectedDate={selectedDate}
                  calYear={calYear}
                  selectedTime={selectedTime}
                  profile={profile}
                  reason={reason}
                  onReasonChange={setReason}
                  error={error}
                  submitting={submitting}
                  onBook={handleBook}
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 size={22} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm">Select a doctor, date, and time to continue.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════ HISTORY TAB ══════════════════════════════ */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">My Appointments</h2>
            <p className="text-xs text-slate-500 mt-0.5">All scheduled and past visits</p>
          </div>
          {myAppointments.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <CalendarIcon size={32} className="mx-auto text-slate-300" />
              <p className="text-slate-400 text-sm">No appointments yet — book your first one!</p>
              <button
                type="button"
                onClick={() => setActiveTab("book")}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-sm"
              >
                Book Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5 bg-slate-50/30">
              {myAppointments.map((a) => {
                const st = {
                  scheduled: { color: "bg-primary/10 text-primary", iconColor: "text-primary", label: "Scheduled" },
                  completed: { color: "bg-emerald-50 text-emerald-700", iconColor: "text-emerald-600", label: "Completed" },
                  cancelled: { color: "bg-rose-50 text-rose-600", iconColor: "text-rose-500", label: "Cancelled" },
                  no_show: { color: "bg-amber-50 text-amber-600", iconColor: "text-amber-500", label: "No Show" },
                }[a.status] || { color: "bg-slate-100 text-slate-600", iconColor: "text-slate-500", label: a.status };

                return (
                  <div
                    key={a.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col gap-4 min-w-0"
                  >
                    {/* Header: Doctor & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`p-2.5 rounded-xl shrink-0 ${st.color}`}>
                          <CalendarIcon size={18} className={st.iconColor} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-sm truncate">
                            {a.doctors?.profiles?.full_name || "Doctor"}
                          </p>
                          <p className="text-xs font-medium text-slate-500 truncate">
                            {a.doctors?.specialties?.name}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shrink-0 ${st.color}`}>
                        {st.label}
                      </span>
                    </div>

                    {/* Date & Time block */}
                    <div className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-700">{a.appointment_date}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-700">{a.appointment_time}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    {a.reason && (
                      <div className="px-1">
                        <p className="text-xs text-slate-500 line-clamp-2 break-words">
                          <strong className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">
                            Reason:
                          </strong>
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
