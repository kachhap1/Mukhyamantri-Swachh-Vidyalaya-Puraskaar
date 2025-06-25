//Heeader.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import Logout from "../Logout";
import { FaUserCircle } from "react-icons/fa";

import logo from "../Assets/jharkhandLogo.png";

const Header = ({ isAuthenticated, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide only the Navbar, keep the logo
  const isHomePage = location.pathname === "/";

  return (
    <header className={`header1 ${isHomePage ? "hide-navbar" : ""}`}>
      <div className="nav-container">
        {/* Logo on the Left */}
        <div className="logo-section">
          <img src={logo} alt="Jharkhand Gov. Logo" className="logo" />
        </div>

        {/* Show Navbar only if NOT on Home Page */}
        {!isHomePage && (
          <>
            <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
              &#9776;
            </div>
            <nav className={isOpen ? "nav open" : "nav"}>
              <ul>
                <li>
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/information" onClick={() => setIsOpen(false)}>
                    Information
                  </Link>
                </li>
                <li>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/e-learning" onClick={() => setIsOpen(false)}>
                    E-Learning
                  </Link>
                </li>
              </ul>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
