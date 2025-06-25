import React, {useEffect,useState} from 'react'
import { Link } from "react-router-dom"; 
import { useAuth } from "../auth/AuthContext";
import HeaderComponent from "../component/HeaderComponent";
import FooterWithoutLogin from "../component/FooterWithoutLogin";
import aboutBanner from "../images/aboutwash.png"; 
import AuthMenu from '../component/AuthMenu';
import Loader from '../component/Loader';
import { apiJSONPost, parseJwtData } from '../api/utility';
import { showNotificationMsg } from '../api/common';
import AuthPermission from '../auth/AuthPermission';


export default function UserDashboard() {
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos,setuserinfos] = useState("");

// const [showDataPermitted, setshowDataPermitted] =useState(false);
// const [reSubmitDataPermitted, setreSubmitDataPermitted] =useState(false);
const [hideFinal,setHideFinal]= useState(false);
const permission = AuthPermission(); 
  const { token, allSurveyData, saveallData } = useAuth();
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';  // You can also use <Navigate to="/login" />
    }
    else{
      const userdata = parseJwtData(token);

       setHideFinal(permission);



      // if(showDataPermission()){
      //   console.log("Permission True");
      //   console.log(showDataPermission());
      //   setshowDataPermitted(showDataPermission());
      // }
      // if(reSubmitPermision()){
      //   console.log("reSubmitPermision : "+ reSubmitPermision()); 
      //   setreSubmitDataPermitted(reSubmitPermision());
      // }
      // else{
      //   console.log("reSubmitPermision : "+ reSubmitPermision());

      //   setreSubmitDataPermitted(reSubmitPermision());
      // }


      // const parsedData =  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
      // if ((parsedData?.final_save === (1 ||"1")) && showDataPermitted && !reSubmitDataPermitted) {
      //   setHideFinal(true);
      // }
      



      
     // console.log(userdata);
      setuserinfos(parseJwtData(token));
      getSurveyInformations(userdata.udise_code,userdata.mobile);
      
    }
    //setShowLoader(false);
  }, [token, permission]);

const getSurveyInformations =(udise_code,mobile) => {
  console.log(udise_code+":"+mobile);
  if(allSurveyData){
    console.log("Data Exists in Context");
    setShowLoader(false);
  }
  else{
    console.log("Save Data ARea");
    const jsonObject = {
      udise_code: udise_code,
      mobile: mobile
    };
    getSchoolData("getAllInformations.php",jsonObject);
  } 
}

const getSchoolData = async (endpoint, jsonData) => {
  try {
    showNotificationMsg("success", "Please Wait ...", {
      autoClose: 3000,
    });
    setShowLoader(true);
    const response = await apiJSONPost(endpoint, jsonData);
    console.log(response);
    if (
      response?.data?.statuscode === 200 &&
      response?.data?.title === "Success"
    ) {
      if (typeof response?.data?.message === "object") {
        // showNotificationMsg("success", "Please Wait ...", {
        //   autoClose: 3000,
        // });
        saveallData(response?.data?.message);
        sessionStorage.setItem("SVSB_All_Data",JSON.stringify(response?.data?.message));
        window.location.reload();
      } else {
        showNotificationMsg("error", response?.data?.message, {
          autoClose: 3000,
        });
      }

      if (response?.data?.token !== null) {
      }
      setShowLoader(false);
    } else {
      showNotificationMsg("error", response?.data?.message, {
        autoClose: 3000,
      });
    }
  } catch (error) {
    console.error("Error posting data:", error);
    if (error?.response?.status === (400 || 404)) {
      showNotificationMsg("error", error?.response?.data, {
        autoClose: 3000,
      });
    } else if (error?.response?.status === 401) {
      showNotificationMsg("error", error?.response?.data, {
        autoClose: 3000,
      });
    } else if (error?.response?.status === 500) {
      showNotificationMsg("error", error?.response?.data, {
        autoClose: 3000,
      });
    }
  }
  finally {
    setShowLoader(false);
  }
  
};


  return (
    <div className="wrapper">
      {showLoader && <Loader /> }
    <HeaderComponent />
    <AuthMenu pageName="dashboard"/>
    <div className="mt-3 mb-3 pb-5 my-5 my-lg-4x">
      <div className="container">
        <div className="row mb-5">
          <div className='col-md-6 offset-md-3'>
          <div className='schoolInfoSection d-flex justify-content-between align-items-center text-dark'>
              <div>Name</div>
              <div>{userinfos?.respondant_name}</div>
            </div>
            <div className='schoolInfoSection d-flex justify-content-between align-items-center text-dark'>
              <div>Mobile</div>
              <div>{userinfos?.mobile}</div>
            </div> 
            <div className='schoolInfoSection d-flex justify-content-between align-items-center text-dark'>
              <div>U-DISE</div>
              <div>{userinfos?.udise_code}</div>
            </div>
            <div className='schoolInfoSection d-flex justify-content-between align-items-center text-dark'>
              <div>School Name</div>
              <div>{userinfos?.school_name}</div>
            </div>
          </div>
          <hr/>
          <div className='col-md-6 '> 
            <ul className="list-group list-group-flush focusedAreas">
            <li className="list-group-item"><Link to="/user/crp_brp"><i className='bx bx-user-circle'></i> CRP / BRP Details </Link></li>
              <li className="list-group-item"><Link to="/user/primary_info"><i className='bx bx-info-circle'></i> Primary Information </Link></li>
              <li className="list-group-item"><Link to="/user/water"><i className='bx bxs-droplet'></i> Water </Link></li>

              <li className="list-group-item"><Link to="/user/toilet"><i className='fas fa-restroom'></i>Toilet </Link></li>

              <li className="list-group-item"><Link to="/user/handwash"><i className='bx bx-donate-blood'></i> Handwashing With Soap </Link></li>

              <li className="list-group-item"><Link to="/user/operation_maintenance"><i className='fas fa-tools'></i>Operations and Maintenance </Link></li>

              <li className="list-group-item"><Link to="/user/behaviour_capacity_buidling"><i className="fas fa-chalkboard-teacher"></i> Behaviour Change and Capacity Building </Link>
              </li>
 
              
              
            </ul>
          </div>
          <div className='col-md-5 offset-md-1'>
          <ul className="list-group list-group-flush focusedAreas">
            

              <li className="list-group-item"><Link to="/user/climate_environment"><i className="fas fa-smog"></i>Climate Change & Environment Sustainability</Link>
              </li>

              <li className="list-group-item"><Link to="/user/mhm"><i className="fas fa-hand-sparkles"></i>Menstrual Hygiene Management (MHM)  </Link>
              </li>

              <li className="list-group-item"><Link to="/user/disaster_school_safety"><i className="fas fa-house-damage"></i>Disaster Management</Link>
              </li>

              <li className="list-group-item"><Link to="/user/health_wellness_program"><i className="fas  fa-file-medical-alt"></i>School Health And Wellness Programme</Link>
              </li>

              <li className="list-group-item"><Link to="/user/mdm"><i className="fas fa-pizza-slice"></i>MDM</Link>
              </li>

              

              <li className="list-group-item"><Link to="/user/uploadimages"><i className='fas fa-file-upload'></i>Upload Images </Link></li> 

              {hideFinal ===false && <li className="list-group-item"><Link to="/user/submission"><i className='fas fa-save'></i>Final Save </Link></li>}
              {hideFinal ===true  && <li className="list-group-item"><Link to="/user/scores"><i className='fas fa-trophy'></i>Score & Rating </Link></li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
    <FooterWithoutLogin />
  </div>
  )
}
