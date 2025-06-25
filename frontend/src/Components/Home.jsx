//Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

import aboutIcon from "./Assets/team.png";
import instructionsIcon from "./Assets/instructions2.png";
import faqIcon from "./Assets/faq2.png";
import loginIcon from "./Assets/loginUser.png";
import dashboardIcon from "./Assets/dashboard (1).png";
import elearningIcon from "./Assets/elearning.png";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-icon-grid">
        <Link to="/about" className="home-icon">
          <img src={aboutIcon} alt="about" />
          <p>About</p>
        </Link>

        <Link to="/instructions" className="home-icon">
          <img src={instructionsIcon} alt="instructions" />
          <p>Instructions</p>
        </Link>

        <Link to="/faq" className="home-icon">
          <img src={faqIcon} alt="faq" />
          <p>FAQ</p>
        </Link>

        <Link to="/login" className="home-icon">
          <img src={loginIcon} alt="login" />
          <p>Login</p>
        </Link>

        <Link to="/dashboard" className="home-icon">
          <img src={dashboardIcon} alt="dashboard" />
          <p>Dashboard</p>
        </Link>

        <Link to="/elearning" className="home-icon">
          <img src={elearningIcon} alt="elearning" />
          <p>E-Learning</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
