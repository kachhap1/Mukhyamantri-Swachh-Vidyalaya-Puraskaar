//Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginSignup.css";

import login_type from "../Assets/loginType.png";
import password_icon from "../Assets/password.png";
import language_icon from "../Assets/language.png";
import udise_icon from "../Assets/udiseCode.png";

const Login = () => {
  const [formData, setFormData] = useState({
    Udise_Code: "",
    password: "",
    loginType: "",
    language: "",
  });
  const [loginError, setLoginError] = useState(""); // State for login error message
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setLoginError(""); // Reset error before new request
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Response:", response.data);
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem("authToken", token); //Store the token
        alert("Login Successful!");
        // onLoginsuccess();
        navigate("/dashboard");
      } else {
        setLoginError("Account doesn't exist, please Register."); // Show error message
      }
    } catch (error) {
      console.log("Login error", error);
      // alert("Login failed!");
      setLoginError("Login failed! Please check your credentials.");
    }
  };

  return (
    <div className="container">
      <div className="header2">
        <div className="text">Sign In</div>
        <div className="underline"></div>
      </div>

      <form className="inputs">
        <div className="input">
          <img src={login_type} alt="Login Type Icon" className="icon" />
          <select
            className="select-option"
            name="loginType"
            onChange={handleChange}
          >
            <option value="">Select Login Type</option>
            <option value="admin">District</option>
            <option value="teacher">School</option>
            <option value="student">State</option>
          </select>
        </div>

        <div className="input">
          <img src={language_icon} alt="Language Icon" className="icon" />
          <select
            className="select-option"
            name="language"
            onChange={handleChange}
          >
            <option value="">Select Language</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>

        <div className="input">
          <img src={udise_icon} alt="Udise Icon" className="icon" />
          <input
            type="text"
            name="Udise_Code"
            placeholder="Udise Number"
            required
            onChange={handleChange}
          />
        </div>

        <div className="input">
          <img src={password_icon} alt="Password Icon" className="icon" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
          />
        </div>

        <div className="forgot-password">
          Forgot Password? {""}
          <span onClick={() => navigate("/forgot-password")}>Click here</span>
        </div>

        <div className="submit-container">
          <button type="button" className="submit" onClick={handleLogin}>
            Sign In
          </button>
        </div>

        {loginError && ( //Show only whne login fails
          <div className="switch-action error-message">
            <p>{loginError}</p>
          </div>
        )}

        {/*Always show register option */}
        <div className="switch-action">
          <p>
            New User?
            <span onClick={() => navigate("/register")}>
              {" "}
              <b>Register</b>
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
