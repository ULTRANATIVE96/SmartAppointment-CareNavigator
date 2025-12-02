// src/components/AdminNavBar.jsx
import { NavLink } from "react-router-dom";

function AdminNavBar() {
  return (
    <nav className="adminNav">
      <NavLink to="/admin" className="home">Admin Home</NavLink>
      <ul>
        <li><NavLink to="/admin/users">Manage Users</NavLink></li>
        <li><NavLink to="/admin/reports">Reports</NavLink></li>
        <li><NavLink to="/admin/settings">Settings</NavLink></li>
      </ul>
    </nav>
  );
}

export default AdminNavBar;
