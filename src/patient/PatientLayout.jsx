import BottomNav from "../NavBars/BottomNav";
import PNavBar from "../NavBars/PNavBar";
import { Outlet } from "react-router-dom";

function PatientLayout() {
  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <Outlet /> {/* This renders the current patient page */}
      </main>
      <BottomNav />
    </div>
  );
}

export default PatientLayout;
