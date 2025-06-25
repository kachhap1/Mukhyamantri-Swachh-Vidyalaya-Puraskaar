import React, {useEffect, useState} from 'react'
// import { Link } from "react-router-dom"; 
import { useAuth } from "../auth/AuthContext";
import HeaderComponent from "../component/HeaderComponent";
import FooterWithoutLogin from "../component/FooterWithoutLogin";
// import aboutBanner from "../images/aboutwash.png"; 
import AuthMenu from '../component/AuthMenu';
import Loader from '../component/Loader';
import { parseJwtData } from '../api/utility';
export default function CRP_BRP() {
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos,setuserinfos] = useState("");
  const { token } = useAuth();
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';  // You can also use <Navigate to="/login" />
    }
    else{
      setuserinfos(parseJwtData(token));
    }
    setShowLoader(false);
  }, [token]);

  return (
    <div className="wrapper">
       {showLoader && <Loader /> }
    <HeaderComponent />
    <AuthMenu pageName="crp_brp"/>
    <div className="mt-3 mb-3 pb-5 my-5 my-lg-4x">
      <div className="container">
        <div className="row"> 
          <div className='col-md-6 fw-semibold'> 
            CRP / BRP Name: 
          </div>
          <div className='col-md-6 fw-semibold'>
            Amit Kumar
          </div>
        </div>
        <div className="row mt-2 mb-2"> 
          <div className='col-md-6 fw-semibold'> 
            Contact: 
          </div>
          <div className='col-md-6 fw-semibold'>
            8888888888
          </div>
        </div>
      </div>
    </div>
    <FooterWithoutLogin />
  </div>
  )
}
