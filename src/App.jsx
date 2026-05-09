import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Patient imports
import PatientLayout from "./patient/PatientLayout.jsx";
import PatientDashboard from "./patient/PatientDashboard.jsx";
import Appointment from "./pages/Appointment.jsx";
import CareJourney from "./pages/CareJourney.jsx";
import Symptoms from "./pages/Symptoms.jsx";

// Admin imports
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";

// Admin pages
import AdminUsers from "./doctor/AdminUsers.jsx";
import AdminReports from "./doctor/AdminReports.jsx";
import AdminSettings from "./doctor/AdminSettings.jsx";
import Profile from "./pages/Profile.jsx";
import AdminProfile from "./pages/AdminProfile.jsx";
import DoctorSchedule from "./doctor/DoctorSchedule.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* ✅ Patient routes */}
      <Route 
        path="/patient" 
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="appointment" element={<Appointment />} />
        <Route path="care-journey" element={<CareJourney />} />
        <Route path="symptoms" element={<Symptoms />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'doctor']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="schedule" element={<DoctorSchedule />} />
      </Route>
    </Routes>
  );
}

export default App;