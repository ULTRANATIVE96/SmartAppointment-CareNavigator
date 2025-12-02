import { NavLink } from "react-router-dom";

function NavBar() {
  return (
    <nav className="patientNav">
      <NavLink to="/" className="home">Home</NavLink>

      <ul>
        <li><NavLink to="/symptoms">Symptoms</NavLink></li>
        <li><NavLink to="/appointment">Appointment</NavLink></li>
        <li><NavLink to="/care-journey">Care Journey</NavLink></li>
      </ul>
    </nav>
  );
}

export default NavBar;
