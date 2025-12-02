import PNavBar from "../NavBars/PNavBar";
import "./Symptoms.css";

 function Symptoms() {
  return (
    <div className="symptoms-container">
      <PNavBar />

      <div className="symptoms-content">
        <h1 className="title">Check Your Symptoms</h1>
        <p className="subtitle">
          Select your symptoms and we’ll help guide you on what to do next.
        </p>

        <div className="symptoms-section">
          <h3>Select Your Symptoms</h3>

          <div className="symptom-list">
            <label>
              <input type="checkbox" /> Fever
            </label>

            <label>
              <input type="checkbox" /> Headache
            </label>

            <label>
              <input type="checkbox" /> Sore Throat
            </label>

            <label>
              <input type="checkbox" /> Chest Pain
            </label>

            <label>
              <input type="checkbox" /> Back Pain
            </label>

            <label>
              <input type="checkbox" /> Cough
            </label>

            <label>
              <input type="checkbox" /> Fatigue
            </label>

            <label>
              <input type="checkbox" /> Shortness of Breath
            </label>
          </div>
        </div>

        <button className="continue-btn">Continue</button>
      </div>
    </div>
  );
}
export default Symptoms;
