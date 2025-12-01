import "./PatientDashboard.css";

function PatientDashboard() {
  return (
    <div className="dashboard-container">
        <div className="header-top">
            <div className="heartbeat-icon">🩺</div> {/* heartbeat scanner */}
            <div className="header-right">
              <div className="notification">🔔</div>
              <img src="/profile.jpg" alt="Profile" className="profile-pic" />
            </div>
          </div>
  <div className="dashboard-main">
   {/* HEADER */}
        <header className="header">
          

          <h2>WELCOME BACK</h2>
          <p>Your health matters. Let’s take care of you.</p>
        </header>

    {/* QUICK ACTIONS */}
    <section className="quick-actions">
      <h3>Your health and journey, simplified</h3>
      <div className="actions-grid">
        <button className="action-card">🏠<span>Home</span></button>
        <button className="action-card">🩺<span>Symptoms</span></button>
        <button className="action-card">📅<span>Appointment</span></button>
        <button className="action-card">🚀<span>Care Journey</span></button>
        <button className="action-card">⚙️<span>Settings</span></button>
      </div>
    </section>

    {/* JOURNEY STARTER */}
    <section className="journey-starter">
      <img src="/cover.jpg" alt="Healthcare" className="cover-img" />
      <div className="journey-text">
        <h3>Start Your Health Journey</h3>
        <p>Track your progress and stay updated with your medical needs.</p>
        <button className="journey-btn">Get Started</button>
      </div>
    </section>
  </div>

  {/* BOTTOM NAV */}
  <nav className="bottom-nav">
    <button>🏠 Home</button>
    <button>🩺 Symptoms</button>
    <button>📅 Appointment</button>
    <button>🚀 Care Journey</button>
    <button>⚙️ Settings</button>
  </nav>
</div>

  );
}

export default PatientDashboard;
