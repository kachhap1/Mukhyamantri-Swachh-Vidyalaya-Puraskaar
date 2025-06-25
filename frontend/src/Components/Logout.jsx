import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Logout.css";

const Logout = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); //clears user session
    navigate("/Login");
  };

  return (
    <div className="user-menu">
      <FaUserCircle
        className="user-icon-log"
        size={30}
        onClick={() => setMenuOpen(!menuOpen)}
      />
      {/* miniNavbar */}
      {menuOpen && (
        <div className="dropdown-mini">
          <button className="logout-btn">Logout</button>
        </div>
      )}
    </div>
  );
};

export default Logout;
