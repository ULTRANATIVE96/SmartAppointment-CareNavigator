import { useState } from 'react';
import './Login.css';

function Login() {
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role || !username || !password) {
      alert('Please fill in all fields');
      return;
    }
    console.log({ role, username, password });
    // Send data to backend API here
  };

  return (
    <div className="login">
      <div className="topHead">
        <h1>WELCOME TO <br /> HEALTHCARE SYSTEM</h1>
      </div>

      <form className="options" onSubmit={handleSubmit}>
        {/* Role Selection */}
        <div className="radioGroup">
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === 'admin'}
              onChange={(e) => setRole(e.target.value)}
            />
            Admin/Clinician
          </label>

          <label>
            <input
              type="radio"
              name="role"
              value="patient"
              checked={role === 'patient'}
              onChange={(e) => setRole(e.target.value)}
            />
            Patient
          </label>
        </div>

        {/* Username */}
        <label htmlFor="username">
          Username
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        {/* Password */}
        <label htmlFor="password">
          Password
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {/* Submit Button */}
        <button type="submit" className="loginBtn">Login</button>
      </form>
    </div>
  );
}

export default Login;
