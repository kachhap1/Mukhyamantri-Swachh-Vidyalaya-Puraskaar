//OtpVerification.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OTPVerification.css";

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  console.log("Location State:", location.state); ////////
  const udiseCode = location.state?.Udise_Code || "";
  useEffect(() => {
    if (!udiseCode && udiseCode === "") {
      alert("Unauthorizede access!");
      navigate("/register");
    }
  }, [udiseCode, navigate]);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerifyOTP = async () => {
    console.log("Udise_Code:", udiseCode, "Entered OTP:", otp); /////
    if (!udiseCode || !otp) {
      alert("Udise Code or OTP is missing!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Sending OTP verification request:", {
        Udise_Code: udiseCode,
        otp,
      });

      const response = await fetch(
        "http://localhost:8000/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Udise_Code: udiseCode, otp }),
        }
      );

      const data = await response.json();
      console.log("Response from server:", data);

      if (data.success) {
        alert("OTP Verified! Please set your Password");
        navigate("/set-password", { state: { Udise_Code: udiseCode } });
      } else {
        setError(data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP Verification Error", error);
      setError("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="containerOTP">
      <h2>OTP Verification</h2>

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        maxLength="6"
      />

      {error && <p className="error-message">{error}</p>}

      <button onClick={handleVerifyOTP} disabled={loading}>
        {loading ? "Verifying..." : "Submit"}
      </button>
    </div>
  );
};

export default OTPVerification;

// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./OTPVerification.css";

// const OTPVerification = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const udiseCode = location.state?.Udise_Code;
//   console.log("Udise Code Received:", udiseCode); // Debugging

//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false); // Loading state
//   const [error, setError] = useState(null); // Error state

//   const handleVerifyOTP = async () => {
//     if (!udiseCode || !otp) {
//       alert("Udise Code or OTP is missing!");
//       return;
//     }

//     setLoading(true);
//     setError(null); // Reset error before request

//     try {
//       console.log("Sending OTP verification request:", {
//         Udise_Code: udiseCode,
//         otp,
//       });

//       const response = await axios.post(
//         "http://localhost:8000/api/auth/verify-otp",
//         { Udise_Code: udiseCode, otp },
//         {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true, // Ensure cookies are sent if needed
//         }
//       );

//       console.log("Response from server:", response.data);

//       if (response.data.success) {
//         alert("OTP Verified! Please set your Password");
//         navigate("/set-password", { state: { Udise_Code: udiseCode } });
//       } else {
//         setError(response.data.message || "OTP verification failed");
//       }
//     } catch (error) {
//       console.error(
//         "OTP Verification Error",
//         error.response?.data || error.message
//       );
//       setError(error.response?.data?.message || "OTP verification failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="containerOTP">
//       <h2>OTP Verification</h2>

//       <input
//         type="text"
//         value={otp}
//         onChange={(e) => setOtp(e.target.value)}
//         placeholder="Enter OTP"
//         maxLength="6"
//       />

//       {error && <p className="error-message">{error}</p>}

//       <button onClick={handleVerifyOTP} disabled={loading}>
//         {loading ? "Verifying..." : "Submit"}
//       </button>
//     </div>
//   );
// };

// export default OTPVerification;

// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./OTPVerification.css";

// const OTPVerification = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const udiseCode = String(location.state?.Udise_Code || "");

//   const [otp, setOtp] = useState("");

//   const handleVerifyOTP = async () => {
//     try {
//       console.log("Sending OTP verification request:", {
//         Udise_Code: udiseCode,
//         otp,
//       }); //////
//       const response = await axios.post(
//         "http://localhost:8000/api/auth/verify-otp",
//         { Udise_Code: udiseCode, otp },
//         {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true, // Ensure cookies are sent
//         }
//       );

//       console.log("Response from server:", response.data); // Debug API Response

//       if (response.data.success) {
//         alert("OTP Verified ! Please set your Password");
//         navigate("/set-password", { state: { Udise_Code: udiseCode } });
//       } else {
//         alert(response.data.message);
//       }
//     } catch (error) {
//       console.error(
//         "OTP Verififcation Error",
//         error.response?.data || error.message
//       );
//       alert("OTP verification failed");
//     }
//   };
//   return (
//     <div className="containerOTP">
//       <h2>OTP Verification</h2>
//       <input
//         type="text"
//         value={otp}
//         onChange={(e) => setOtp(e.target.value)}
//         placeholder="Enter OTP"
//       />
//       <button onClick={handleVerifyOTP}>Submit</button>
//     </div>
//   );
// };

// export default OTPVerification;
