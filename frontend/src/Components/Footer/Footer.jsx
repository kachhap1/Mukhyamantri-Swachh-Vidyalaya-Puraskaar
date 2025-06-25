import React from "react";
import {Link} from "react-router-dom";
import "./Footer.css";

const Footer =()=>{
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-text">
                Copyright © {new Date().getFullYear()} SVSB. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
export default Footer;