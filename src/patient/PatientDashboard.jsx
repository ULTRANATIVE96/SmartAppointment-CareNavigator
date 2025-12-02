import PNavBar from "../NavBars/PNavBar";
import BottomNav from "../NavBars/BottomNav";
import "./PatientDashboard.css";

function PatientDashboard() {
  return (
    
      <main className="dashboard-main">
        {/* Header with welcome text, notification icon, and profile */}
   <section className="dashboard-header">
  {/* Top row: notification + profile on the right */}
  <div className="header-top">
    <div className="header-right">
      <span className="notification-icon" title="Notifications">🔔</span>
      <img
        src="/assets/profile.jpg"
        alt="Profile"
        className="profile-pic"
      />
    </div>
  </div>

  {/* Welcome text BELOW the icons */}
  <div className="header-left">
    <h1>Welcome back — We're here to help</h1>
    <p>Your health journey, simplified.</p>
  </div>
</section>



        {/* Quick Actions */}
        <section className="quick-actions">
          <div className="actions-grid">
            <div className="action-card" onClick={() => window.location.href = "/patient/symptoms"}>
              <span role="img" aria-label="stethoscope">🩺</span>
              <p>Symptom Checker</p>
            </div>
            <div className="action-card" onClick={() => window.location.href = "/patient/appointment"}>
              <span role="img" aria-label="calendar">📅</span>
              <p>Book Appointment</p>
            </div>
            <div className="action-card" onClick={() => window.location.href = "/patient/care-journey"}>
              <span role="img" aria-label="progress">📈</span>
              <p>Care Journey Tracker</p>
            </div>
          </div>
        </section>

        {/* Journey Starter */}
        <section className="journey-starter">
          <div className="journey-content">
            <h2>Start Your Personalized Health Journey</h2>
            <p>Get recommendations, book appointments, and track your progress all in one place.</p>
            <button onClick={() => window.location.href = "/patient/care-journey"}>
              Start Your Journey →
            </button>
          </div>
        </section>
      </main>

    
  );
}

export default PatientDashboard;
