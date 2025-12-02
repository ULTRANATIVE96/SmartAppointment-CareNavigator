import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import PatientLayout from "./patient/PatientLayout.jsx";
import PatientDashboard from "./patient/PatientDashboard.jsx";
import Appointment from "./pages/Appointment.jsx";
import CareJourney from "./pages/CareJourney.jsx";
import Symptoms from "./pages/Symptoms.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Patient routes wrapped in layout */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<PatientDashboard />} />
        <Route path="appointment" element={<Appointment />} />
        <Route path="care-journey" element={<CareJourney />} />
        <Route path="symptoms" element={<Symptoms />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<div>Manage Users</div>} />
      <Route path="/admin/reports" element={<div>Reports</div>} />
      <Route path="/admin/settings" element={<div>Settings</div>} />
    </Routes>
  );
}

export default App;
