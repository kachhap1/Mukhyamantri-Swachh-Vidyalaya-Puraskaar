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

export default function MenstrualHygieneManagement() {
    const nav = useNavigate();
    const [showLoader, setShowLoader] = useState(true);
    const [userinfos, setuserinfos] = useState("");
  
  
    const { token,allSurveyData,saveScores,scores,saveallData, showDataPermission,reSubmitPermision  } = useAuth();
    const {
      register,
      handleSubmit,
      setValue,
      control,
      formState: { errors },
      watch,
      trigger,
    } = useForm();
    // useEffect(() => {
    //   if (!token) {
    //     window.location.href = "/login"; // You can also use <Navigate to="/login" />
    //   } else {
    //     setuserinfos(parseJwtData(token));
    //     if(JSON.parse(allSurveyData)?.mhm &&  JSON.parse(allSurveyData)?.mhm!== undefined ){
    //       PreFillData(allSurveyData);
    //     }
    //   }
    //   setShowLoader(false);
    // }, [token]);
  
  
    useEffect(() => {
      if (!token) {
        window.location.href = "/login";
      } else {
        setuserinfos(parseJwtData(token)); 
        const parsedData =  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
        if (parsedData?.mhm) {
          PreFillData(parsedData);
        }

        if(showDataPermission()){
          console.log("Permission True");
          console.log(showDataPermission());
        }
        if(reSubmitPermision()){
          console.log("reSubmitPermision : "+ reSubmitPermision()); 
        }
        else{
          console.log("reSubmitPermision : "+ reSubmitPermision());
        }
      }
      setShowLoader(false);
    }, [token, allSurveyData]);



    const PreFillData =(allSurveyData)=>{  
       let primaryDatas = (allSurveyData)?.mhm;
       console.log(primaryDatas); 
       primaryDatas =  (typeof primaryDatas === 'string') ? JSON.parse(primaryDatas) : primaryDatas;
       if(primaryDatas && Object.keys(primaryDatas).length){
        Object.keys(primaryDatas).forEach((key) => {
          setValue(key, primaryDatas[key]); // Set value for the respective form field
        });
      }
      
    }
    //const district3Value = watch("district3", "");
  
    const onSubmit = (mhm_data) => {

      setShowLoader(true);

      if (mhm_data && Object.keys(mhm_data).length > 0) {
        let sum = 0;
        for (const key in mhm_data) {
          const value = mhm_data[key].replace('ans_', ''); 
          sum += parseFloat(value);
        }
    
        console.log("Max Score: 15, Obtained:", sum);
        
        // Update AuthContext
      const mhmSurveyData=  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

        const updatedSurveyData = { ...mhmSurveyData, mhm: mhm_data };
        saveallData(updatedSurveyData);
        saveScores("MHM", { max: 7, got: sum });

        const jsonObject = {
          udise_code: userinfos.udise_code,
          mobile: userinfos.mobile,
          columnname:"mhm" ,
          data: mhm_data,
          columnname1:"scores" ,
          scores: "MHM||15||"+sum
        };
  
        sessionStorage.setItem("mhm",JSON.stringify(mhm_data));
          postData("saveSurvey.php",  JSON.stringify(jsonObject));


    
        showNotificationMsg("success", "Data Saved!", { autoClose: 3000 });
    
        // Navigate to another page or stay
        setTimeout(() => {
          nav("/user/dashboard");
        }, 1000);
      } else {
        console.log("Missing Inputs");
        showNotificationMsg("error", "Missing Inputs!", { autoClose: 3000 });
      }
      setShowLoader(false);


      // setShowLoader(true);
      // if (mhm_data && Object.keys(mhm_data).length > 0) {
      //   let sum = 0;

      // // Loop through the object and add the value after replacing "ans_"
      // for (const key in mhm_data) {
      //     const value = mhm_data[key].replace('ans_', ''); // Remove 'ans_' from the value
      //     sum += parseFloat(value); // Convert to float and add to the sum
      // }
      // console.log("Max Score: 15, Obtained:"+ sum);
      // saveScores("MHM", { "max": 7, "got": sum });
      //   //console.log(updatedData);
      //   //saveSchoolPrimaryInfo(updatedData);
      //   showNotificationMsg("success", "Please Wait ...", {
      //     autoClose: 3000,
      //   });
      //   // setTimeout(() => {
      //   //   nav("/user/water");
      //   // }, 1500);
  
      //   const jsonObject = {
      //     udise_code: userinfos.udise_code,
      //     mobile: userinfos.mobile,
      //     columnname:"mhm" ,
      //     data: mhm_data,
      //     columnname1:"scores" ,
      //     scores: "MHM||7||"+sum
      //   };
      //   if(sessionStorage.hasOwnProperty("SVSB_All_Data")){
      //     let sessionObj  = JSON.parse(sessionStorage?.SVSB_All_Data);
      //     sessionObj.mhm = JSON.stringify(mhm_data);
      //     sessionStorage.setItem('SVSB_All_Data', JSON.stringify(sessionObj));
      //   }
  
      //   postData("saveSurvey.php",  JSON.stringify(jsonObject));
      // } else {
      //   console.log("Missing Inputs");
      //   showNotificationMsg("error", "Missing Inputs !!", { autoClose: 3000 });
      // }
      // setShowLoader(false);
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
        <AuthMenu pageName="mhm_info" />
        <p className="text-center">
        <span className="d-block text-primary fw-bold">(7 Marks)</span>
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
    <label htmlFor="emergency_sanitary_pads" className="col-form-label">
      2.7.1. Are emergency sanitary pads available in the Pad bank at any given point of time? (क्या पैड बैंक में आपातकालीन सैनिटरी पैड किसी भी समय उपलब्ध हैं?)
      {errors.emergency_sanitary_pads && (
        <span className="text-danger">
          {errors.emergency_sanitary_pads.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${errors.emergency_sanitary_pads ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.00"
        {...register("emergency_sanitary_pads", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं)</label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.emergency_sanitary_pads ? "border-danger" : ""}`}
        type="radio"
        value="ans_1.00"
        {...register("emergency_sanitary_pads", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="sanitary_pads_per_year" className="col-form-label">
      2.7.2. Number of sanitary pads available to each girl in upper primary per year: (प्रत्येक लड़की को प्रति वर्ष कितने सैनिटरी पैड उपलब्ध होते हैं (उच्च प्राथमिक में)?)
      {errors.sanitary_pads_per_year && (
        <span className="text-danger">
          {errors.sanitary_pads_per_year.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${errors.sanitary_pads_per_year ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.50"
        {...register("sanitary_pads_per_year", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Less than 72 Pads/yr. (72 पैड/वर्ष से कम) </label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.sanitary_pads_per_year ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.75"
        {...register("sanitary_pads_per_year", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">72 Pads/yr. (72 पैड/वर्ष)</label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.sanitary_pads_per_year ? "border-danger" : ""}`}
        type="radio"
        value="ans_1.00"
        {...register("sanitary_pads_per_year", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">More than 72 Pads/yr.(72 पैड/वर्ष से अधिक)</label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="sanitary_waste_disposal_method" className="col-form-label">
      2.7.3. Which of the following options is used by the school for safe treatment/disposal of sanitary waste? (An incinerator in working condition maintaining adequate burning temperature or deep burial of waste with adequate precautions) (विद्यालय सैनिटरी कचरे के सुरक्षित उपचार/निपटान के लिए निम्नलिखित में से कौन सा विकल्प इस्तेमाल करता है? (कार्यात्मक इन्किनरेटर जो उपयुक्त जलने का तापमान बनाए रखता हो या कचरे का गहरी खुदाई के साथ निपटान किया जाता हो))
      {errors.sanitary_waste_disposal_method && (
        <span className="text-danger">
          {errors.sanitary_waste_disposal_method.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${errors.sanitary_waste_disposal_method ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.00"
        {...register("sanitary_waste_disposal_method", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No specific measures (कोई विशिष्ट उपाय नहीं) </label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.sanitary_waste_disposal_method ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.50"
        {...register("sanitary_waste_disposal_method", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Deep burial pit (गहरा गढ्ढा) </label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.sanitary_waste_disposal_method ? "border-danger" : ""}`}
        type="radio"
        value="ans_1.00"
        {...register("sanitary_waste_disposal_method", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Disposed in a manual incinerator (मैन्युअल भस्मीकरण में निपटान) </label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.sanitary_waste_disposal_method ? "border-danger" : ""}`}
        type="radio"
        value="ans_1.00"
        {...register("sanitary_waste_disposal_method", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Disposed in an electric incinerator (इलेक्ट्रिक भस्मीकरण में निपटान) </label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="safe_waste_disposal_condition" className="col-form-label">
      2.7.4. Does the school have safe treatment/disposal options (incinerator in working condition or deep burial of waste with adequate precautions) in working condition for disposal of sanitary waste? (क्या विद्यालय में सैनिटरी कचरे के सुरक्षित उपचार/निपटान के लिए कार्यात्मक भस्मीकरण या गहरे गढ्ढा की सुविधा है?)
      {errors.safe_waste_disposal_condition && (
        <span className="text-danger">
          {errors.safe_waste_disposal_condition.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${errors.safe_waste_disposal_condition ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.00"
        {...register("safe_waste_disposal_condition", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.safe_waste_disposal_condition ? "border-danger" : ""}`}
        type="radio"
        value="ans_1.00"
        {...register("safe_waste_disposal_condition", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="mhm_education_frequency" className="col-form-label">
      2.7.5. Is menstrual health management regularly discussed with or taught to students of appropriate age (at least once in 3 months)? (क्या मासिक धर्म स्वास्थ्य प्रबंधन को नियमित रूप से छात्रों के साथ (उचित उम्र के छात्रों) (कम से कम तीन महीने में एक बार) पर चर्चा की जाती है या पढ़ाया जाता है?)
      {errors.mhm_education_frequency && (
        <span className="text-danger">
          {errors.mhm_education_frequency.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${errors.mhm_education_frequency ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.00"
        {...register("mhm_education_frequency", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.mhm_education_frequency ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.50"
        {...register("mhm_education_frequency", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Only with girls (केवल लड़कियों के साथ)- </label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.mhm_education_frequency ? "border-danger" : ""}`}
        type="radio"
        value="ans_1.00"
        {...register("mhm_education_frequency", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">With both girls and boys (लड़कों और लड़कियों दोनों के साथ) </label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="mhm_lab_established" className="col-form-label">
      2.7.6. Has the MHM Lab been established in the school (Only for class 6 and above)? ( क्या विद्यालय में MHM लैब स्थापित की गई है (केवल कक्षा 6 और ऊपर के स्कूलों के लिए)?)
      {errors.mhm_lab_established && (
        <span className="text-danger">
          {errors.mhm_lab_established.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${errors.mhm_lab_established ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.00"
        {...register("mhm_lab_established", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.mhm_lab_established ? "border-danger" : ""}`}
        type="radio"
        value="ans_1.00"
        {...register("mhm_lab_established", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="use_of_iec_materials" className="col-form-label">
      2.7.7. Do teachers use any IEC materials to educate students on Sanitation and Hygiene and MHM? ( क्या शिक्षक छात्रों को स्वच्छता, हाइजीन और MHM पर शिक्षित करने के लिए कोई IEC सामग्री का उपयोग करते हैं?)
      {errors.use_of_iec_materials && (
        <span className="text-danger">
          {errors.use_of_iec_materials.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${errors.use_of_iec_materials ? "border-danger" : ""}`}
        type="radio"
        value="ans_0.00"
        {...register("use_of_iec_materials", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं) </label>
    </div>
    <div className="form-check">
      <input
        className={`form-check-input ${errors.use_of_iec_materials ? "border-danger" : ""}`}
        type="radio"
        value="ans_1.00"
        {...register("use_of_iec_materials", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes (हाँ) </label>
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
