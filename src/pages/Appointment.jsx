import "./Appointment.css";
import NavBar from "../NavBars/PNavBar";
import { NavLink } from "react-router-dom";

export default function Appointment() {
  const dates = [
    { day: "Sun", date: 30 },
    { day: "Mon", date: 1 },
    { day: "Tue", date: 2 },
    { day: "Wed", date: 3 },
  ];

  const doctors = [
    "Dr. Emily Smith (General Medicine)",
    "Dr. John Doe (Pediatrics)",
    "Dr. Jane Lee (Cardiology)",
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM",
    "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM",
    "02:30 PM", "03:00 PM", "03:30 PM",
  ];

  return (
    <div className="appointment-wrapper">
      <NavBar />

      {/* Title Bar */}
<div className="title-bar">
  <NavLink to="/patient" className="title-link">
  <span className="back-icon">{"<"}</span>
  <h2 className="title">Book Appointment</h2>

   </NavLink>
</div>

      <p className="subtitle">Select a date, provider, and time slot below.</p>

      {/* Date Selection */}
      <h3 className="section-title">Select Date</h3>
      <div className="date-container">
        {dates.map((d, index) => (
          <button key={index} className="date-box">
            <span>{d.day}</span><br/>
            <strong>{d.date}</strong>
          </button>
        ))}
      </div>

      {/* Provider Selection */}
      <div className="provider-card">
        <h3>Select Provider</h3>
        {doctors.map((doc, index) => (
          <label key={index} className="provider-option">
            <input type="radio" name="doctor" />
            <span>{doc}</span>
          </label>
        ))}
      </div>

      {/* Time Slots */}
      <h3 className="section-title">Select Time Slot</h3>
      <div className="time-container">
        {timeSlots.map((t, index) => (
          <button key={index} className="time-box">
            {t}
          </button>
        ))}
      </div>

      {/* Confirm Button */}
      <button className="confirm-btn">Confirm Appointment</button>
    </div>
  );
}
