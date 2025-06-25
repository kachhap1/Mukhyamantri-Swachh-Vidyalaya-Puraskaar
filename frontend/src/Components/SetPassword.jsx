import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SetPassword.css"; // Import the CSS file

const SetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const udiseCode = location.state?.Udise_Code;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSetPassword = async () => {
    if (!password || !confirmPassword) {
      alert("Both fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/set-password",
        {
          Udise_Code: udiseCode,
          password,
        }
      );

      if (response.data.success) {
        alert("Password set successfully. You can now log in.");
        navigate("/login");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(
        "Password Setup Error",
        error.response?.data || error.message
      );
      alert("Failed to set password. Please try again.");
    }
  };

  return (
    <div className="set-password-container">
      <div className="containerPass">
        <h2 className="title">Set Your Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm password"
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={handleSetPassword} className="submit-btn">
          Set Password
        </button>
      </div>
    </div>
  );
};

export default SetPassword;
