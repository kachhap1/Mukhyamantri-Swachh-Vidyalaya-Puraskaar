import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css"; // Ensure CSS file is imported

const ForgotPassword = () => {
  const [udiseCode, setUdiseCode] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.put(
        "http://localhost:8000/pai/users/update-profile",
        { Mobile_No: mobileNo, Password: newPassword },
        { headers: { Authorization: udiseCode } } // Send Udise Code in headers
      );
      if (response.data.success) {
        setSuccess("Password updated successfully");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2 className="forgot-password-title">Forgot Password</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleResetPassword} className="forgot-password-form">
          <input
            type="text"
            placeholder="Enter Udise Code"
            value={udiseCode}
            onChange={(e) => setUdiseCode(e.target.value)}
            className="forgot-password-input"
            required
          />

          <input
            type="text"
            placeholder="Enter Mobile No."
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            className="forgot-password-input"
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="forgot-password-input"
            required
          />

          <button type="submit" className="forgot-password-button">
            Reset Password
          </button>

          <p className="forgot-password-text">
            <span
              className="forgot-password-link"
              onClick={() => navigate("/login")}
            >
              <b>Login</b> Here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
