import { useNavigate, useLocation } from "react-router-dom";
import "./BottomNav.css";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

const navItems = [
  { label: "Home", icon: "🏠", path: "/patient" },
  { label: "Symptoms", icon: "🩺", path: "/patient/symptoms" },
  { label: "Appointments", icon: "📅", path: "/patient/appointment" },
  { label: "Care Journey", icon: "📈", path: "/patient/care-journey" },
];


  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={location.pathname === item.path ? "active" : ""}
          onClick={() => navigate(item.path)}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default BottomNav;
