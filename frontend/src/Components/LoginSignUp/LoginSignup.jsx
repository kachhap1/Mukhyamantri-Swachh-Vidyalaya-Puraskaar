import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../Components/Login";
import Register from "../Components/Register";
import ForgetPassword from "../ForgotPassword";

const LoginSignup = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-apssword" element={<ForgetPassword />} />
      </Routes>
    </Router>
  );
};

export default LoginSignup;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./LoginSignup.css";

// import login_type from "../Assets/loginType.png";
// import user_icon from "../Assets/user.png";
// import password_icon from "../Assets/password.png";
// import language_icon from "../Assets/language.png";
// import udise_icon from "../Assets/udiseCode.png";
// import designation_icon from "../Assets/designation.png";
// import telephone_icon from "../Assets/telephone.png";

// const LoginSignup = () => {
//   const [action, setAction] = useState("Sign In");
//   const [formData, setFormData] = useState({
//     name: "",
//     usdiseNumber: "",
//     designation: "",
//     mobileNumber: "",
//     password: "",
//   });

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleRegister = async () => {
//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/users/register",
//         formData
//       );
//       if (response.data.success) {
//         alert("OTP sent for verification");
//         navigate("/verify-otp", {
//           state: { mobileNumber: formData.mobileNumber },
//         }); //This is an object with a state property, which itself is an object containing a mobile property. The value of mobile is taken from formData.mobile
//       } else {
//         alert(response.data.message);
//       }
//     } catch (error) {
//       console.log("Registration error", error);
//       alert("Regitration failed!");
//     }
//   };

//   const handleLogin = async () => {
//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/users/login",
//         {
//           usdiseNumber: formData.usdiseNumber,
//           password: formData.password,
//         }
//       );
//       if (response.data.success) {
//         alert("Login successful");
//         navigate("/dashboard"); // redirect after successful login
//       } else {
//         alert(response.data.message);
//       }
//     } catch (error) {
//       console.log("Login Error", error);
//       alert("Login failed!");
//     }
//   };

//   return (
//     <div className="container">
//       {/* <Header />          Including Header component */}
//       <div className="header2">
//         <div className="text">{action}</div>
//         <div className="underline"></div>
//       </div>

//       <form className="inputs">
//         {action === "Sign In" && (
//           <div className="input">
//             <img src={login_type} alt="Login Type Icon" className="icon" />
//             <select className="select-option">
//               <option value="">Select Login Type</option>
//               <option value="admin">District</option>
//               <option value="teacher">School</option>
//               <option value="student">State</option>
//             </select>
//           </div>
//         )}

//         {action !== "Register" && (
//           <div className="input">
//             <img src={language_icon} alt="Language Icon" className="icon" />
//             <select className="select-option">
//               <option value="">Select Language</option>
//               <option value="english">English</option>
//               <option value="hindi">Hindi</option>
//             </select>
//           </div>
//         )}

//         {action === "Register" && (
//           <div className="input">
//             <img src={user_icon} alt="User Icon" className="icon" />
//             <input
//               type="text"
//               name="name"
//               placeholder="Name of Respondent"
//               maxLength="50"
//               pattern="[A-Za-z\s]+$"
//               required
//               onChange={handleChange}
//             />
//           </div>
//         )}

//         <div className="input">
//           <img src={udise_icon} alt="Udise Icon" className="icon" />
//           <input
//             type="text"
//             name="udiseNumber"
//             placeholder="Udise Number"
//             maxLength="11"
//             pattern="[0-9]{12}"
//             required
//             onChange={handleChange}
//           />
//         </div>

//         {action === "Register" && (
//           <>
//             <div className="input">
//               <img
//                 src={designation_icon}
//                 alt="Designation Icon"
//                 className="icon"
//               />
//               <select name="designation" className="select-option">
//                 <option value="">Select Designation</option>
//                 <option value="principal">
//                   Head Master / Head Mistress / Principal
//                 </option>
//                 <option value="vice_principal">School-in-Charge</option>
//                 <option value="teacher">Warden</option>
//                 <option value="staff">Others</option>
//               </select>
//             </div>
//             <div className="input">
//               <img src={telephone_icon} alt="Mobile Icon" className="icon" />
//               <input
//                 type="tel"
//                 name="mobileNumber"
//                 placeholder="Mobile Number"
//                 maxLength="10"
//                 pattern="[0-9]{10}"
//                 required
//                 onChange={handleChange}
//               />
//             </div>
//           </>
//         )}

//         {action !== "Register" && (
//           <div className="input">
//             <img src={password_icon} alt="Password Icon" className="icon" />
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               required
//               onChange={handleChange}
//             />
//           </div>
//         )}

//         <div className="forgot-password">
//           Forgot Password? <span>Click here</span>
//         </div>

//         <div className="submit-contaier">
//           {action === "Sign In" ? (
//             <button type="button" className="submit" onClick={handleLogin}>
//               Sign In
//             </button>
//           ) : (
//             <button type="button" className="submit" onClick={handleRegister}>
//               Register
//             </button>
//           )}
//         </div>

//         <div className="switch-action">
//           {action === "Sign In" ? (
//             <p>
//               Account doesn't exist{" "}
//               <span onClick={() => setAction("Register")}>Register</span>
//             </p>
//           ) : (
//             <p>
//               Account already exists{" "}
//               <span onClick={() => setAction("Sign In")}>Sign In</span>
//             </p>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default LoginSignup;
