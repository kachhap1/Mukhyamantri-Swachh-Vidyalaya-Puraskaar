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

export default function ClimateEnvironment() {
    const nav = useNavigate();
    const [showLoader, setShowLoader] = useState(true);
    const [userinfos, setuserinfos] = useState("");
    // const [hidePanchayat, sethidePanchayat] = useState(false);
    // const [hideVillage, sethideVillage] = useState(false);
  
    // const [showUrbanBodyName, setshowUrbanBodyName] = useState(false);
    // const [showWardName, setshowWardName] = useState(false);
  
    const { token,allSurveyData,saveScores,scores ,saveallData } = useAuth();
    const {
      register,
      handleSubmit,
      setValue,
      control,
      formState: { errors },
      watch,
      trigger,
    } = useForm();

const isEcoClubFormed = watch("eco_club_formed");

    useEffect(() => {
      if (!token) {
        window.location.href = "/login"; // You can also use <Navigate to="/login" />
      } else {
        setuserinfos(parseJwtData(token));
        const parsedData =  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
        if(parsedData){
          if(parsedData?.climate_environment  ){
            PreFillData(parsedData);
          }
        }
      }
      setShowLoader(false);
    }, [token]);
  
  
    const PreFillData =(allSurveyData)=>{  
       let primaryDatas = (allSurveyData)?.climate_environment ;
       console.log(primaryDatas); 
       primaryDatas =  (typeof primaryDatas === 'string') ? JSON.parse(primaryDatas) : primaryDatas;
       if(primaryDatas && Object.keys(primaryDatas).length){
        Object.keys(primaryDatas).forEach((key) => {
          setValue(key, primaryDatas[key]); // Set value for the respective form field
        });
      }
     
    }
    //const district3Value = watch("district3", "");
  
    const onSubmit = (climate_data) => {
      setShowLoader(true);
      if (climate_data && Object.keys(climate_data).length > 0) {
        let sum = 0;

      // Loop through the object and add the value after replacing "ans_"
      for (const key in climate_data) {
          const value = climate_data[key].replace('ans_', ''); // Remove 'ans_' from the value
          sum += parseFloat(value); // Convert to float and add to the sum
      }
      console.log("Max Score: 15, Obtained:"+ sum);

      const mhmSurveyData=  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

      const updatedSurveyData = { ...mhmSurveyData, climate_environment: climate_data };
      saveallData(updatedSurveyData);

      saveScores("Climate", { "max": 10, "got": sum });
        showNotificationMsg("success", "Please Wait ...", {
          autoClose: 3000,
        });
        // setTimeout(() => {
        //   nav("/user/water");
        // }, 1500);
  
        const jsonObject = {
          udise_code: userinfos.udise_code,
          mobile: userinfos.mobile,
          columnname:"climate_environment" ,
          data: climate_data,
          columnname1:"scores" ,
          scores: "Climate||22||"+sum
        };
  

        if(sessionStorage.hasOwnProperty("SVSB_All_Data")){
          let sessionObj  = JSON.parse(sessionStorage?.SVSB_All_Data);
          sessionObj.climate_environment = JSON.stringify(climate_data);
          sessionStorage.setItem('SVSB_All_Data', JSON.stringify(sessionObj));
        }
           postData("saveSurvey.php",  JSON.stringify(jsonObject));
      } else {
        console.log("Missing Inputs");
        showNotificationMsg("error", "Missing Inputs !!", { autoClose: 3000 });
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
            sessionStorage.setItem("SVSB_primary_saved","yes");
            sessionStorage.setItem("scores", JSON.stringify(response?.data?.upd_scores)); 
            setTimeout(() => {
              nav("/user/dashboard");
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
        <AuthMenu pageName="climate_info" />
        <p className="text-center">
        <span className="d-block text-primary fw-bold">(22 Marks)</span>
        </p>
        <div className="mt-3 mb-3 pb-5 my-5 my-lg-4x innerBg">
          <div className="container">
            <form
              className={`rowx g-3 needs-validation `}
              autoComplete="off"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
             <div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="eco_club_formed" className="col-form-label">
      1. Whether the Eco Club formed in the school? (क्या विद्यालय में इको क्लब बना है?)
      {errors.eco_club_formed && (
        <span className="text-danger">
          {errors.eco_club_formed.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_formed ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("eco_club_formed", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_formed ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_1.00"
        {...register("eco_club_formed", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>
  </div>
</div>
{isEcoClubFormed ==="ans_1.00" && (
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="eco_club_members" className="col-form-label">
      2.6.2 If yes, number of members in Eco Club _______( अगर हाँ, तो इको क्लब के सदस्यों की संख्या)
      {errors.eco_club_members && (
        <span className="text-danger">
          {errors.eco_club_members.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <input
      type="text"
      className={`form-control ${
        errors.eco_club_members ? "is-invalid" : ""
      }`}
      {...register("eco_club_members", { required: "Please enter number of members" })}
    />
  </div>
</div>)}

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="eco_club_meeting_regularly" className="col-form-label">
      2.6.3 Whether Eco Club members meeting regularly? (क्या इको क्लब के सदस्य नियमित रूप से बैठक करते हैं?)
      {errors.eco_club_meeting_regularly && (
        <span className="text-danger">
          {errors.eco_club_meeting_regularly.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_meeting_regularly ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_1.00"
        {...register("eco_club_meeting_regularly", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Monthly (मासिक) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_meeting_regularly ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("eco_club_meeting_regularly", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Once in three months (तीन महीने में एक बार)- </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_meeting_regularly ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.25"
        {...register("eco_club_meeting_regularly", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Once in 6 months (छह महीने में एक बार) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_meeting_regularly ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("eco_club_meeting_regularly", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Never (कभी नहीं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="eco_club_register_maintained" className="col-form-label">
      2.6.4 Whether Eco Club register maintained (क्या इको क्लब का रजिस्टर रखा जाता है?)
      {errors.eco_club_register_maintained && (
        <span className="text-danger">
          {errors.eco_club_register_maintained.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_register_maintained ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("eco_club_register_maintained", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_register_maintained ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("eco_club_register_maintained", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="eco_club_members_trained" className="col-form-label">
      2.6.5 Whether the Eco club members are trained? (क्या इको क्लब के सदस्य प्रशिक्षित हैं?)
      {errors.eco_club_members_trained && (
        <span className="text-danger">
          {errors.eco_club_members_trained.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_members_trained ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("eco_club_members_trained", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_members_trained ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("eco_club_members_trained", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="eco_hackathon_participation" className="col-form-label">
      2.6.6 Whether the school students participated in Eco Hackathon in 2024? (क्या विद्यालय के छात्रों ने 2024 में इको हैकथॉन में भाग लिया?)
      {errors.eco_hackathon_participation && (
        <span className="text-danger">
          {errors.eco_hackathon_participation.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_hackathon_participation ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("eco_hackathon_participation", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_hackathon_participation ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("eco_hackathon_participation", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="nodal_teacher_wash" className="col-form-label">
      2.6.7 Does school have a nodal teacher for WASH? (क्या विद्यालय में WASH के लिए एक नोडल शिक्षक है?)
      {errors.nodal_teacher_wash && (
        <span className="text-danger">
          {errors.nodal_teacher_wash.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.nodal_teacher_wash ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("nodal_teacher_wash", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.nodal_teacher_wash ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("nodal_teacher_wash", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="nodal_teacher_trained" className="col-form-label">
      2.6.8 Whether the WASH Nodal teacher trained? (क्या WASH नोडल शिक्षक प्रशिक्षित हैं?)
      {errors.nodal_teacher_trained && (
        <span className="text-danger">
          {errors.nodal_teacher_trained.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.nodal_teacher_trained ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_1.00"
        {...register("nodal_teacher_trained", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.nodal_teacher_trained ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("nodal_teacher_trained", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="swachhata_action_plan" className="col-form-label">
      2.6.9 Has the school developed a Climate Resilient "Swachhata Action Plan" integrating all likely preventive measures for reducing WASH system vulnerability? (क्या विद्यालय ने जलवायु-प्रतिरोधी "स्वच्छता एक्शन योजना" तैयार की है जो WASH प्रणाली की संवेदनशीलता को कम करने के लिए सभी संभावित निवारक उपायों को एकीकृत करती है?)
      {errors.swachhata_action_plan && (
        <span className="text-danger">
          {errors.swachhata_action_plan.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.swachhata_action_plan ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("swachhata_action_plan", {
          required: "*",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.swachhata_action_plan ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("swachhata_action_plan", {
          required: "*",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="school_climate_vulnerable" className="col-form-label">
      2.6.10 Is your school vulnerable to climate change linked to natural hazards? (क्या आपका विद्यालय जलवायु परिवर्तन से जुड़े प्राकृतिक खतरों के प्रति संवेदनशील है?)
      {errors.school_climate_vulnerable && (
        <span className="text-danger">
          {errors.school_climate_vulnerable.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_climate_vulnerable ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("school_climate_vulnerable", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_climate_vulnerable ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.25"
        {...register("school_climate_vulnerable", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Not sure (मालूम नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_climate_vulnerable ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("school_climate_vulnerable", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="adopted_5rs_waste_management" className="col-form-label">
      2.6.11 Has your school adopted the 5R’s (refuse, reduce, reuse, repurpose, and then recycle) in its waste management Standard Operating Procedures (SOP)? (क्या आपके विद्यालय ने 5R's (अस्वीकार, कम करना, पुन: उपयोग, पुनर्निर्माण, और फिर पुनर्चक्रण) को अपने अपशिष्ट प्रबंधन मानक संचालन प्रक्रियाओं (SOP) में अपनाया है?)
      {errors.adopted_5rs_waste_management && (
        <span className="text-danger">
          {errors.adopted_5rs_waste_management.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.adopted_5rs_waste_management ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("adopted_5rs_waste_management", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.adopted_5rs_waste_management ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("adopted_5rs_waste_management", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="segregate_waste" className="col-form-label">
      2.6.12 Does the school segregate wet waste (bio-degradable waste) and dry waste (non-biodegradable waste)? (क्या विद्यालय जैविक अपशिष्ट (गीला अपशिष्ट) और गैर-जैविक अपशिष्ट (सूखा अपशिष्ट) को अलग करता है?)
      {errors.segregate_waste && (
        <span className="text-danger">
          {errors.segregate_waste.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.segregate_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("segregate_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.segregate_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("segregate_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="compost_bio_waste" className="col-form-label">
      2.6.13 How does the school compost its own biodegradable waste (wet waste)? (विद्यालय अपने जैविक अपशिष्ट (गीले अपशिष्ट) को कैसे खाद बनाता है?)
      {errors.compost_bio_waste && (
        <span className="text-danger">
          {errors.compost_bio_waste.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.compost_bio_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("compost_bio_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No specific measure (कोई विशिष्ट उपाय नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.compost_bio_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.25"
        {...register("compost_bio_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, waste is taken away for composting by someone. .( अपशिष्ट को किसी अन्य स्थान पर खाद बनाने के लिए ले जाया जाता है।)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.compost_bio_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("compost_bio_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, on school premises (विद्यालय परिसर में खाद बनाते हैं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="dispose_non_bio_waste" className="col-form-label">
      2.6.14 How does the school dispose of its non-biodegradable waste (dry waste)? (विद्यालय अपने गैर-बायोडिग्रेडेबल अपशिष्ट (सूखा अपशिष्ट) को कैसे नष्ट करता है?)
      {errors.dispose_non_bio_waste && (
        <span className="text-danger">
          {errors.dispose_non_bio_waste.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.dispose_non_bio_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("dispose_non_bio_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No specific measure / throw anywhere/ dumped at a place aside in campus/ nearby/ Burnt on school premises (कोई विशिष्ट उपाय नहीं / कहीं भी फेंक देते हैं / परिसर में अलग जगह पर फेंकते हैं / विद्यालय परिसर में जलाते हैं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.dispose_non_bio_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.25"
        {...register("dispose_non_bio_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Buried on school premises (विद्यालय परिसर में दफनाया जाता है)  </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.dispose_non_bio_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("dispose_non_bio_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Collection by municipality/Panchayat (नगरपालिका/पंचायत द्वारा एकत्र किया जाता है) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="waste_audit_conducted" className="col-form-label">
      2.6.15 Whether waste audit has been conducted in the school? (क्या विद्यालय में अपशिष्ट ऑडिट किया गया है?)
      {errors.waste_audit_conducted && (
        <span className="text-danger">
          {errors.waste_audit_conducted.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.waste_audit_conducted ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("waste_audit_conducted", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.waste_audit_conducted ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("waste_audit_conducted", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="water_audit_conducted" className="col-form-label">
      2.6.16 Whether a water audit has been conducted in the school? (क्या विद्यालय में जल ऑडिट किया गया है?)
      {errors.water_audit_conducted && (
        <span className="text-danger">
          {errors.water_audit_conducted.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.water_audit_conducted ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("water_audit_conducted", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.water_audit_conducted ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("water_audit_conducted", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="energy_audit_conducted" className="col-form-label">
      2.6.17 Whether energy audit has been conducted in the school? ( क्या विद्यालय में ऊर्जा ऑडिट किया गया है?)
      {errors.energy_audit_conducted && (
        <span className="text-danger">
          {errors.energy_audit_conducted.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.energy_audit_conducted ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("energy_audit_conducted", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.energy_audit_conducted ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("energy_audit_conducted", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="maintain_clean_green" className="col-form-label">
      2.6.18 Whether school maintained clean and green environment within the school campus? (क्या विद्यालय ने परिसर में स्वच्छ और हरियाली का वातावरण बनाए रखा है?)
      {errors.maintain_clean_green && (
        <span className="text-danger">
          {errors.maintain_clean_green.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.maintain_clean_green ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("maintain_clean_green", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.maintain_clean_green ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("maintain_clean_green", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.maintain_clean_green ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.25"
        {...register("maintain_clean_green", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Partially (आंशिक रूप से)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="school_planted_saplings" className="col-form-label">
      2.6.19 Whether school planted the saplings within the school campus or outside or at home? (क्या विद्यालय ने परिसर के भीतर या बाहर या घर पर पौधारोपण किया है?)
      {errors.school_planted_saplings && (
        <span className="text-danger">
          {errors.school_planted_saplings.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_planted_saplings ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_1.00"
        {...register("school_planted_saplings", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_planted_saplings ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("school_planted_saplings", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_planted_saplings ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("school_planted_saplings", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Partially (आंशिक रूप से) </label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="school_nutrition_garden" className="col-form-label">
      2.6.20 Whether the school premises have a nutrition garden or have taken up Plantation/greening measures? (क्या विद्यालय के परिसर में एक पोषण उद्यान है या पौधारोपण/हरियाली बढ़ाने के उपाय किए गए हैं?)
      {errors.school_nutrition_garden && (
        <span className="text-danger">
          {errors.school_nutrition_garden.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_nutrition_garden ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("school_nutrition_garden", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_nutrition_garden ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.25"
        {...register("school_nutrition_garden", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes - Kitchen garden  (हाँ, रसोई उद्यान)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_nutrition_garden ? "border-danger" : ""
        }`} 
        type="radio"
        value="ans_0.50"
        {...register("school_nutrition_garden", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes - Plantation (हाँ, पौधारोपण) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.school_nutrition_garden ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_1.00"
        {...register("school_nutrition_garden", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Both Nutritional garden/ Plantation (दोनों पोषण उद्यान/पौधारोपण)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="eco_club_celebrated_days" className="col-form-label">
      2.6.21 Whether school celebrated important days through Eco Club as per the guideline? (क्या विद्यालय ने इको क्लब के अनुसार महत्वपूर्ण दिनों को मनाया है?)
      {errors.eco_club_celebrated_days && (
        <span className="text-danger">
          {errors.eco_club_celebrated_days.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_celebrated_days ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("eco_club_celebrated_days", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.eco_club_celebrated_days ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("eco_club_celebrated_days", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="waste_recycling_activity" className="col-form-label">
      2.6.22 Whether school has undertaken any waste recycling activity/ doing waste recycling/ repurposing? ? (क्या विद्यालय ने किसी प्रकार के अपशिष्ट पुनर्चक्रण गतिविधि की है/ कर रहा है?)
      {errors.waste_recycling_activity && (
        <span className="text-danger">
          {errors.waste_recycling_activity.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.waste_recycling_activity ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("waste_recycling_activity", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.waste_recycling_activity ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("waste_recycling_activity", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="innovative_waste_reuse" className="col-form-label">
      2.6.23 Has the school taken any innovative measures for the reuse of waste material (such as using plastic bottles and toffee wrappers for making bricks for fencing of vegetation/plants)? (क्या विद्यालय ने अपशिष्ट सामग्री के पुन: उपयोग के लिए कोई नवाचारी उपाय किए हैं (जैसे प्लास्टिक बोतल और टॉफी के कवर का उपयोग करके पौधों/वृक्षों के लिए बाड़ बनाने के लिए)?)
      {errors.innovative_waste_reuse && (
        <span className="text-danger">
          {errors.innovative_waste_reuse.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.innovative_waste_reuse ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("innovative_waste_reuse", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.innovative_waste_reuse ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("innovative_waste_reuse", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="ban_single_use_plastic" className="col-form-label">
      2.6.24 Has school clearly developed rules to reduce, minimize or ban the use of single-use plastic? ? (क्या विद्यालय ने सिंगल-यूज प्लास्टिक के उपयोग को कम करने, न्यूनतम करने या प्रतिबंधित करने के लिए स्पष्ट नियम बनाए हैं?)
      {errors.ban_single_use_plastic && (
        <span className="text-danger">
          {errors.ban_single_use_plastic.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.ban_single_use_plastic ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("ban_single_use_plastic", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.ban_single_use_plastic ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("ban_single_use_plastic", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="switch_off_appliances" className="col-form-label">
      2.6.25 Whether school has implemented "Switch off appliances from plug, points when not in use" and got it implemented? (क्या विद्यालय ने "जब उपयोग में न हो तो उपकरणों को प्लग प्वाइंट से बंद करने" की योजना बनाई है और इसे लागू किया है?)
      {errors.switch_off_appliances && (
        <span className="text-danger">
          {errors.switch_off_appliances.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.switch_off_appliances ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("switch_off_appliances", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.switch_off_appliances ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("switch_off_appliances", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="electricity_supply" className="col-form-label">
      2.6.26 Whether school has electricity supply in working conditions? (क्या विद्यालय में बिजली की आपूर्ति क्रियाशील  स्थिति में है?)
      {errors.electricity_supply && (
        <span className="text-danger">
          {errors.electricity_supply.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.electricity_supply ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("electricity_supply", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.electricity_supply ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("electricity_supply", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="lpg_gas_usage" className="col-form-label">
      2.6.27 Is there usage of LPG gas or other cleaner fuel sources for mid-day meals? (क्या विद्यालय में मध्याह्न भोजन के लिए एलपीजी गैस या अन्य स्वच्छ ईंधन स्रोत का उपयोग किया जाता है?)
      {errors.lpg_gas_usage && (
        <span className="text-danger">
          {errors.lpg_gas_usage.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.lpg_gas_usage ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("lpg_gas_usage", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.lpg_gas_usage ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("lpg_gas_usage", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="led_lights_installed" className="col-form-label">
      2.6.28 Whether school has installed LED lights? (क्या विद्यालय ने एलईडी लाइट्स स्थापित की हैं?)
      {errors.led_lights_installed && (
        <span className="text-danger">
          {errors.led_lights_installed.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.led_lights_installed ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("led_lights_installed", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.led_lights_installed ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("led_lights_installed", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="reduce_noise_pollution" className="col-form-label">
      2.6.29 Has the school taken up noteworthy steps towards reducing noise pollution, including creating silent zones within and nearby the school campus?( क्या विद्यालय ने शोर प्रदूषण को कम करने के लिए महत्वपूर्ण कदम उठाए हैं, जिसमें विद्यालय परिसर के भीतर और आस-पास शांत क्षेत्र बनाए गए हैं?)
      {errors.reduce_noise_pollution && (
        <span className="text-danger">
          {errors.reduce_noise_pollution.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.reduce_noise_pollution ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("reduce_noise_pollution", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.reduce_noise_pollution ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("reduce_noise_pollution", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="local_traditional_wisdom" className="col-form-label">
      2.6.30 Does the school engage children in listing and understanding local traditional wisdom, culture, practices for environment conservation? ? (क्या विद्यालय बच्चों को स्थानीय पारंपरिक ज्ञान, संस्कृति, और पर्यावरण संरक्षण के लिए प्रथाओं को सूचीबद्ध करने और समझने में संलग्न करता है?)
      {errors.local_traditional_wisdom && (
        <span className="text-danger">
          {errors.local_traditional_wisdom.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.local_traditional_wisdom ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("local_traditional_wisdom", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.local_traditional_wisdom ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("local_traditional_wisdom", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="biodiversity_register" className="col-form-label">
      2.6.31 Is the preparation of a Biodiversity register by students being undertaken in the school level? (क्या विद्यालय में छात्रों द्वारा जैव विविधता रजिस्टर तैयार किया जा रहा है?)
      {errors.biodiversity_register && (
        <span className="text-danger">
          {errors.biodiversity_register.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.biodiversity_register ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("biodiversity_register", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.biodiversity_register ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("biodiversity_register", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="nature_walk" className="col-form-label">
      2.6.32 Do students in the school are engaged in a "Nature walk" to explore, appreciate and learn the value of environmental conservation and biodiversity? (क्या विद्यालय में छात्रों को "प्राकृतिक यात्रा" (Nature walk) में संलग्न किया जाता है ताकि वे पर्यावरण संरक्षण और जैव विविधता के मूल्य को समझ सकें और सराह सकें?)
      {errors.nature_walk && (
        <span className="text-danger">
          {errors.nature_walk.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.nature_walk ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("nature_walk", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.nature_walk ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("nature_walk", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="safe_environment_climate_education" className="col-form-label">
      2.6.33 Does the school take up safe environment and climate education (including water, sanitation, and hygiene) through classroom/session using suitable age-appropriate pedagogy, including hands-on activities, project work, experiential learning, morning assembly, etc.? (क्या विद्यालय कक्षा/सत्रों के माध्यम से सुरक्षित पर्यावरण और जलवायु शिक्षा (जिनमें जल, स्वच्छता, और हाइजीन) देता है, जिसमें उपयुक्त आयु-उपयुक्त पेडागोगी, हाथों से गतिविधियाँ, परियोजना कार्य, अनुभवात्मक सीखने, सुबह की सभा आदि शामिल हैं?)
      {errors.safe_environment_climate_education && (
        <span className="text-danger">
          {errors.safe_environment_climate_education.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.safe_environment_climate_education ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("safe_environment_climate_education", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.safe_environment_climate_education ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("safe_environment_climate_education", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="climate_action_points" className="col-form-label">
      2.6.34 Has the school identified key climate action points to be focused among the school children? ( क्या विद्यालय ने बच्चों के बीच फोकस करने के लिए प्रमुख जलवायु क्रियावली (Climate action points) की पहचान की है?)
      {errors.climate_action_points && (
        <span className="text-danger">
          {errors.climate_action_points.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.climate_action_points ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("climate_action_points", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.climate_action_points ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.25"
        {...register("climate_action_points", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Not sure (नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.climate_action_points ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("climate_action_points", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="awareness_sops_for_wash" className="col-form-label">
      2.6.35 Is the school aware of the requirements of the Standard Operating Procedures (SOPs) for Sustaining Water, Sanitation & Hygiene in schools? (क्या विद्यालय जल, स्वच्छता और हाइजीन को बनाए रखने के लिए मानक संचालन प्रक्रिया (SOPs) के आवश्यकताओं के बारे में जागरूक है?)
      {errors.awareness_sops_for_wash && (
        <span className="text-danger">
          {errors.awareness_sops_for_wash.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.awareness_sops_for_wash ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("awareness_sops_for_wash", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.awareness_sops_for_wash ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("awareness_sops_for_wash", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="rain_water_harvesting" className="col-form-label">
      2.6.36 Is there a functional rainwater harvesting facility in the school? (क्या विद्यालय में वर्षा जल संचयन की कार्यात्मक सुविधा है?)
      {errors.rain_water_harvesting && (
        <span className="text-danger">
          {errors.rain_water_harvesting.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.rain_water_harvesting ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("rain_water_harvesting", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Not available (उपलब्ध नहीं है) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.rain_water_harvesting ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("rain_water_harvesting", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes – Groundwater recharge system (भूमिगत जल पुनर्भरण प्रणाली)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.rain_water_harvesting ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.75"
        {...register("rain_water_harvesting", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes – Rainwater storage system (वर्षा जल संचयन प्रणाली) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.rain_water_harvesting ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_1.00"
        {...register("rain_water_harvesting", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Both rainwater storage and groundwater recharge system (दोनों, वर्षा जल संचयन और भूमिगत जल पुनर्भरण प्रणाली)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="water_conservation_strategies" className="col-form-label">
      2.6.37 Has the school developed its water conservation, wastewater reduction strategies? ( क्या विद्यालय ने जल संरक्षण, अपशिष्ट जल घटाने की रणनीतियाँ विकसित की हैं?)
      {errors.water_conservation_strategies && (
        <span className="text-danger">
          {errors.water_conservation_strategies.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.water_conservation_strategies ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("water_conservation_strategies", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.water_conservation_strategies ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("water_conservation_strategies", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="secured_handwashing_facility" className="col-form-label">
      2.6.38 Is the handwashing facility in the school secured against any potential risk or obstruction (for example electrical pole/ stand-alone structure/ tree nearby etc. that can damage in case of climate event/natural hazard? (क्या विद्यालय में हाथ धोने की सुविधा किसी भी संभावित जोखिम या अड़चन से सुरक्षित है (जैसे बिजली के खंभे/स्वतंत्र संरचना/पास में पेड़ आदि जो जलवायु घटना/प्राकृतिक आपदा के मामले में नुकसान पहुंचा सकते हैं)?)
      {errors.secured_handwashing_facility && (
        <span className="text-danger">
          {errors.secured_handwashing_facility.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.secured_handwashing_facility ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("secured_handwashing_facility", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.secured_handwashing_facility ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("secured_handwashing_facility", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="swachhata_action_plan" className="col-form-label">
      2.6.39 Has the school developed a Swachhata Action Plan (SAP)?( क्या विद्यालय ने स्वच्छता कार्य योजना (SAP) विकसित की है?)
      {errors.swachhata_action_plan && (
        <span className="text-danger">
          {errors.swachhata_action_plan.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.swachhata_action_plan ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.00"
        {...register("swachhata_action_plan", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.swachhata_action_plan ? "border-danger" : ""
        }`}
        type="radio"
        value="ans_0.50"
        {...register("swachhata_action_plan", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ)</label>
    </div>
  </div>
</div>
 


  
              <div className="mt-2 mb-5 row">
                <div className="col-md-12 text-center">
                  <button
                    type="submit"
                    className="btn btn-primary form-controlx customBtnx"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <FooterWithoutLogin />
      </div>
    );
  }
