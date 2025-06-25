//App.js
// import 'bootstrap/dist/css/bootstrap.min.css'; // to use bootstrap


import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import "./App.css";

import PrivateRoute from "./Components/PrivateRoute";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import Login from "./Components/LoginSignUp/Login";
import Register from "./Components/LoginSignUp/Register";
// import LoginSignup from "./Components/LoginSignUp/LoginSignup";
import OTPVerification from "./Components/OTPVerification";
import SetPassword from "./Components/SetPassword";
import Home from "./Components/Home";
import About from "./Components/About";
import Instructions from "./Components/Instructions";
import FAQ from "./Components/FAQ";
import Dashboard from "./Components/Dashboard";
import ELearning from "./Components/ELearning";
// import UploadImage from "./Components/UploadImages";
import ForgotPassword from "./Components/ForgotPassword";
// import API from "./api/axiosInstance";


// additional sections for Dashboard
import PrimaryInfo from "./Components/forms/PrimaryInfo";
import Water from "./Components/forms/Water";
import Toilet from "./Components/forms/Toilet";
import Handwashing from "./Components/forms/Handwash";
import OperationMaintenance from "./Components/forms/OperationMaintenance";
import BehaviourChangeCapacityBuilding from "./Components/forms/BehaviourChangeCapacityBuilding";
import UploadImages from "./Components/forms/UploadImages";
import ClimateEnvironment from "./Components/forms/ClimateEnvironment";
import MenstrualHygieneManagement from "./Components/forms/MenstrualHygieneManagement";
import DisasterManagement from "./Components/forms/DisasterManagement";
import SchoolHealthWellnessProgram from "./Components/forms/SchoolHealthWellnessProgram";
import MDM from "./Components/forms/MDM";


// // Private Route Component to Protect Dashboard & Other Routes
// const PrivateRoute = ({ element }) => {
//   const token = localStorage.getItem("token"); // Check if user is logged in
//   return token ? element : <Navigate to="/login" />;
// };



function App() {
  // const [imageUrl, setImageUrl] = useState("");
  // const [backendMessage, setBackendMessge] = useState("");

  // useEffect(() => {
  //   API.get("/status")
  //     .then((res) => {
  //       setBackendMessge(res.data.message);
  //     })
  //     .catch((error) => {
  //       console.error("Error connecting to backend", error);
  //       setBackendMessge("Failed to connect");
  //     });
  // }, []);

  return (
    <AuthProvider>
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/information" element={<Instructions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/login" element={<LoginSignup />} /> */}
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/set-password" element={<SetPassword />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/faq" element={<FAQ />} />
          <Route path="/e-learning" element={<ELearning />} />
          {/* <Route path="/upload" element={<UploadImage />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />


        {/* New routes from Dashboard */}
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/primary-information" element={<PrivateRoute element={<PrimaryInfo />} />} />      
         <Route path="/water" element={<Water />} />
          <Route path="/toilet" element={<Toilet />} />
          <Route path="/handwashing" element={<Handwashing />} />
          <Route path="/OperationMaintenance" element={<OperationMaintenance />} />
          <Route path="/capacity-building" element={<BehaviourChangeCapacityBuilding />} />
          <Route path="/climate-change" element={<ClimateEnvironment/>}/>
          {/* <Route path="/menstrual-hygiene" element={<MenstrualHygieneManagement />}/> */}
          <Route path="/disaster-management" element={<DisasterManagement/>}/>
          <Route path="/school-health-wellness" element={<SchoolHealthWellnessProgram/>}/>
          <Route path="/midday-meal" element={<MDM/>}/>
          <Route path="/upload2" element={<UploadImages/>}/>
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

// import React from "react";
// import "./App.css";
// import LoginSignup from "./Components/LoginSignUp/LoginSignup";

// function App() {
//   return (
//     <div className="App">
//       <LoginSignup />
//     </div>
//   );
// }

// export default App;
