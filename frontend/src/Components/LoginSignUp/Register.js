//Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginSignup.css";

import user_icon from "../Assets/user.png";
import udise_icon from "../Assets/udiseCode.png";
import designation_icon from "../Assets/designation.png";
import telephone_icon from "../Assets/telephone.png";
// import password_icon from "../Assets/password.png";

const Register = () => {
  const [formData, setFormData] = useState({
    Respondent_Name: "",
    Udise_Code: "",
    Designation: "",
    Mobile_No: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    console.log("Sending data:", formData); ////
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/register",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Response:", response.data); ///
      if (response.data.success) {
        alert("OTP sent for verification");
        navigate("/otp-verification", {
          state: { Udise_Code: formData?.Udise_Code },
        });
      } else {
        alert(response.data.message || "Registratin failed!");
      }
    } catch (error) {
      console.log("Registration error", error.response?.data || error.message);
      if (error.response && error.response.data) {
        alert(error.response.data.message || "Registration failed!");
      } else {
        alert("Registration fialed!Try again");
      }
    }
  };

  return (
    <div className="container">
      <div className="header2">
        <div className="text">Register</div>
        <div className="underline"></div>
      </div>

      <form className="inputs">
        <div className="input">
          <img src={user_icon} alt="User Icon" className="icon" />
          <input
            type="text"
            name="Respondent_Name"
            placeholder="Name of Respondent"
            required
            onChange={handleChange}
          />
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
          <img src={designation_icon} alt="Designation Icon" className="icon" />
          <select
            className="select-option"
            name="Designation"
            onChange={handleChange}
          >
            <option value="">Select Designation</option>
            <option value="principal">Head Master / Principal</option>
            <option value="vice_principal">School-in-Charge</option>
            <option value="teacher">Warden</option>
            <option value="staff">Others</option>
          </select>
        </div>

        <div className="input">
          <img src={telephone_icon} alt="Mobile Icon" className="icon" />
          <input
            type="tel"
            name="Mobile_No"
            maxLength="10"
            placeholder="Mobile Number"
            required
            onChange={handleChange}
          />
        </div>

        {/*  */}

        <div className="submit-container">
          <button type="button" className="submit" onClick={handleRegister}>
            Register
          </button>
        </div>

        <div className="switch-action">
          <p>
            Account already exists?{" "}
            <span onClick={() => navigate("/login")}>
              <b>Sign In</b>
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
