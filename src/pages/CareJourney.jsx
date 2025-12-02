import "./CareJourney.css";
import NavBar from "../NavBars/PNavBar";

 function CareJourney() {
  const steps = [
    {
      title: "Check-in",
      detail: "Locate the reception desk on Level 2 upon arrival."
    },
    {
      title: "Consultation",
      detail: "Proceed to Room 305 for your doctor’s appointment."
    },
    {
      title: "Lab",
      detail: "Visit the lab for blood tests. Follow the signs."
    },
    {
      title: "Pharmacy",
      detail: "Collect your prescriptions on the Ground Floor."
    },
  ];

  const progress = 25;

  return (
    <div className="care-wrapper">
      <NavBar />
      <h2 className="page-title">Your Care Path</h2>

      {/* Progress Section */}
      <div className="progress-card">
        <div className="progress-top">
          <span>Step 1 of 4</span>
          <span>{progress}% Complete</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: progress + "%" }}></div>
        </div>
      </div>

      {/* Steps List */}
      {steps.map((step, index) => (
        <div key={index} className="step-card">
          <div className="step-number">{index + 1}</div>

          <div className="step-info">
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </div>

          <button className="next-btn">→</button>
        </div>
      ))}

      {/* Facility Map */}
      <div className="facility-card">
        <h3>Facility Map</h3>
        <img src="/map.png" alt="Hospital Map" className="map-img" />
        <p>
          You are currently here. Follow the highlighted path to your next destination.
        </p>
      </div>
    </div>
  );
}

export default CareJourney;
