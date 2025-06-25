import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import HeaderComponent from "../component/HeaderComponent";
import FooterWithoutLogin from "../component/FooterWithoutLogin";
// import aboutBanner from "../images/aboutwash.png";
import AuthMenu from "../component/AuthMenu";
import Loader from "../component/Loader";
import { apiJSONPost, parseJwtData } from "../api/utility";
import { useForm, Controller } from "react-hook-form";
import { showNotificationMsg } from "../api/common";
import { useNavigate } from "react-router-dom";

export default function FinalSubmisison() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");
  const [formFilledStatus, setformFilledStatus] = useState({});
  const formsNamesArr = ['primary_info','water_info','toilet_info','handwash_info','opr_maintenance','behaviour_capacity','climate_environment','mhm','disaster','health_wellness','mdm'
   ,'images_info'];
   const [trueArr, setTrueArr] = useState([]);
   const [allFormsFilled, setAllFormsFilled] = useState(false);
  const { token,allSurveyData,saveSchoolPrimaryInfo, saveallData  } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch,
    trigger,
  } = useForm();
  useEffect(() => {
    setShowLoader(true);
    if (!token) {
      window.location.href = "/login"; // You can also use <Navigate to="/login" />
    } else {
      setuserinfos(parseJwtData(token));
      const userdata = parseJwtData(token);
      getSurveyInformations(userdata?.udise_code,userdata?.mobile);
      setTimeout(() => {
          // const parsedData =  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
          // if(parsedData){
          //     PreFillData(parsedData); 
          //   }
      }, 1500);
      
    }
    setShowLoader(false);
  }, [token]);


  const getSurveyInformations =(udise_code,mobile) => {
    console.log(udise_code+":"+mobile); 
      console.log("Save Data ARea");
      const jsonObject = {
        udise_code: udise_code,
        mobile: mobile
      };
      getSchoolData("getAllInformations.php",jsonObject); 
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
           
          saveallData(response?.data?.message);
          sessionStorage.setItem("SVSB_All_Data",JSON.stringify(response?.data?.message));
           
          const parsedData =  (typeof response?.data?.message === 'string') ? JSON.parse(response?.data?.message) : response?.data?.message;
          if(parsedData){
              PreFillData(parsedData); 
            }


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
  const PreFillData =(allSurveyData)=>{  
    let setTrueArr =[];
     const primaryDatas =  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
      //console.log(primaryDatas); 
      let jsonKeyObj = {};
      const sco_data = JSON.parse(allSurveyData?.scores);
      Object.keys(primaryDatas).map((key,i)=>{
        //console.log(key);
        try {
          // Attempt to parse the data
          const jsonData =  (typeof primaryDatas[key] === 'string') ? JSON.parse(primaryDatas[key]) : primaryDatas[key];
          
          // If parsing is successful and it's an object, store the index
          if (typeof jsonData === "object") {
            if(key ==="water_info" && sco_data?.hasOwnProperty("Water") &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="toilet_info" && sco_data?.hasOwnProperty("Toilet") &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="handwash_info" && sco_data?.hasOwnProperty("HandWashing") &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="opr_maintenance" && sco_data?.hasOwnProperty("OnM") &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="behaviour_capacity" && sco_data?.hasOwnProperty("BehaviourCapacityBuidling") &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="climate_environment" && sco_data?.hasOwnProperty("Climate") &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="mhm" && sco_data?.hasOwnProperty("MHM") &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="primary_info" && typeof (jsonData) ==='object' &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="disaster" && typeof jsonData  ==='object' &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="health_wellness" && typeof jsonData  ==='object' &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="mdm" && typeof jsonData  ==='object' &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="images_info" && typeof jsonData  ==='object' &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            else if(key ==="final_save" && typeof jsonData  ==='object' &&  jsonData !== null){
              jsonKeyObj[key] = "True";
            }
            
            else{
              jsonKeyObj[key] = "False";
            }
            
          }
        } catch (error) {
          // If parsing fails (invalid JSON), simply skip this key
          //console.error(`Invalid JSON for key: ${key}, skipping...`); 
          jsonKeyObj[key] = "False";
        }
        if(formsNamesArr.includes(key)){
            if(jsonKeyObj[key] ==="True"){
              setTrueArr[key] = "True"; 
            }
            else{
              setTrueArr[key] = "False";
            } 
        } 
        //jsonKeyObj[key] =i;
      });

      setformFilledStatus(jsonKeyObj);
      const alltrueFalse = Object.values(setTrueArr).every(value => value === "True");
      setAllFormsFilled(alltrueFalse);
    //  primaryDatas &&  Object.keys(primaryDatas).forEach((key) => {
    //   setValue(key, primaryDatas[key]); // Set value for the respective form field
    // });
    
  }
  //const district3Value = watch("district3", "");

  const onSubmit = (data) => {
    setShowLoader(true);
    if (data && Object.keys(data).length === 0) {
      const updatedData = 1;
      //console.log(updatedData);
      saveSchoolPrimaryInfo(updatedData);


      const mhmSurveyData=  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

        const updatedSurveyData = { ...mhmSurveyData, final_save: updatedData };
        saveallData(updatedSurveyData);

      showNotificationMsg("success", "Please Wait ...", {
        autoClose: 3000,
      });
      // setTimeout(() => {
      //   nav("/user/water");
      // }, 1500);

      const jsonObject = {
        udise_code: userinfos.udise_code,
        mobile: userinfos.mobile,
        columnname:"final_save" ,
        data: updatedData
      };


       postData("saveSurvey.php",  JSON.stringify(jsonObject));
    } else {
      console.log("Missing Inputs");
      showNotificationMsg("error", "Wrong Inputs !!", { autoClose: 3000 });
    }
    setShowLoader(false);
  };

  const postData = async (endpoint, jsonData ) => {
    try {
      const response = await apiJSONPost(endpoint, jsonData);
      console.log(response);
      if (
        response?.data?.statuscode === 200 &&
        response?.data?.title === "Success"
      ) {
        if (typeof response?.data?.message !== "object") {
          showNotificationMsg("success", response?.data?.message, {
            autoClose: 3000,
          });

          let sessionData = JSON.parse(sessionStorage.getItem("SVSB_All_Data"));
          sessionData.final_save =1;


          sessionStorage.setItem("SVSB_All_Data",JSON.stringify(sessionData));
          setTimeout(() => {
            nav("/user/scores");
          }, 1000);
          

        } else {
          showNotificationMsg("error", response?.data?.message, {
            autoClose: 3000,
          });
        }

        if (response?.data?.token !== null) {
        }
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
    setShowLoader(false);
  };

  
  // Common function to handle input change, focusout, and blur
  const handleInputChange = async (e) => {
    const { name, value } = e.target; // Get the name and value of the input
    setValue(name, value); // Update the form value

    // Trigger validation for the specific input field
    await trigger(name);

    // Apply border color dynamically based on validity
    const inputElement = e.target;
    if (errors[name]) {
      inputElement.classList.add("border-danger");
      inputElement.classList.remove("border-successXX");
    } else if (value) {
      inputElement.classList.add("border-successXX");
      inputElement.classList.remove("border-danger");
    } else {
      // If the input is empty and there's no error, remove the border color
      inputElement.classList.remove("border-danger", "border-success");
    }
  };
  // const handleSetValue = (elementId,value) => {
  //   setValue(elementId, value); // Set the radio button value dynamically
  // };

  return (
    <div className="wrapper">
      {showLoader && <Loader />}
      <HeaderComponent />
      <AuthMenu pageName="" />
      <p className="text-center">
        Final Submission   <span className="text-dark" onClick={()=>window.location.reload()}><i className="fas fa-sync-alt"></i></span>
      </p>
      <div className="mt-3 mb-3 pb-5 my-5 my-lg-4x innerBg">
        <div className="container">
          <form
            className={`rowx g-3 needs-validation `}
            autoComplete="off"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >

            
             <div className="mt-2 mb-5 row">
                <div className="col-md-12 text-center">

                  {
                    Object.keys(formFilledStatus).map((key)=>{
                      if(formsNamesArr.includes(key)){
                        return <div className="rowx mb-2 d-flex justify-content-between" key={key}>
                        <div>{key.toUpperCase().replace(/_/g, " ")}</div>
                        <div>{formFilledStatus[key] ==="True"?  <span className="text-success"><i className='fas fa-check-circle'></i></span> :<span className="text-danger"><i className='fas fa-times-circle'></i></span>}</div>
                      </div>;
                      }
                     
                    })
                  }


                  {allFormsFilled && 
                    <>
                  <button
                    type="submit"
                    className="mt-3 btn btn-primary form-controlx customBtnx"
                  >
                    Final Submission
                  </button>
                  <p className="text-danger"><small>Data Can be Finally Submitted only One Time.</small></p></>}
                  {!allFormsFilled && <h3 className="text-danger">Missing Some Inputs, Please Check Above !!</h3>}
                </div>
              </div>
                 
          </form>
        </div>
      </div>
      <FooterWithoutLogin />
    </div>
  );
}
