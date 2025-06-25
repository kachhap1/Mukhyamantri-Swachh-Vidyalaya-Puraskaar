import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
// import HeaderComponent from "../component/HeaderComponent";
// import FooterWithoutLogin from "../component/FooterWithoutLogin";
// import aboutBanner from "../images/aboutwash.png";
import AuthMenu from "../AuthMenu";
import Loader from "../Loader";
import "./Water.css";

import { apiJSONPost, parseJwtData } from "../../api/utility";
import { useForm, Controller } from "react-hook-form";
import { showNotificationMsg } from "../../api/common";
import { useNavigate } from "react-router-dom";
import {checkPermission} from '../../auth/AuthPermission';
export default function Water() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");
  const [disbaleSaveBtn, setDisableSaveBtn] =useState(false);
  // const [hidePanchayat, sethidePanchayat] = useState(false);
  // const [hideVillage, sethideVillage] = useState(false);

  // const [showUrbanBodyName, setshowUrbanBodyName] = useState(false);
  // const [showWardName, setshowWardName] = useState(false);
  const [hideFinal,setHideFinal]= useState(false);
//   const permission = AuthPermission(); 
const permission = checkPermission(userinfos,"WaterFormAccess");
  const { token,allSurveyData,saveScores,scores , saveallData } = useAuth();
 
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
    if (!token) {
      window.location.href = "/login"; // You can also use <Navigate to="/login" />
    } else {
      setHideFinal(permission);
      setuserinfos(parseJwtData(token));
      const parsedData =  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
      if(parsedData?.water_info){
        PreFillData(parsedData);
      }
    }
    setShowLoader(false);
  }, [token,permission]);


  const PreFillData =(allSurveyData)=>{  
    let primaryDatas = allSurveyData?.water_info;
    console.log(primaryDatas); 
      primaryDatas =  (typeof primaryDatas === 'string') ? JSON.parse(primaryDatas) : primaryDatas;  
    
   if(primaryDatas && Object.keys(primaryDatas).length ){
    setDisableSaveBtn(false);
    Object.keys(primaryDatas).forEach((key) => {
      setValue(key, primaryDatas[key]); // Set value for the respective form field
    });
    // if (primaryDatas?.wq5_water_testing === "2-Urban") {
       
    //   sethidePanchayat(true);
    //   sethideVillage(true);
    //   setshowUrbanBodyName(true);
    //   setshowWardName(true);
    //   setValue(
    //     "urban_body_name5",
    //     primaryDatas?.urban_body_name5
    //   );
    //   setValue("ward_name6", primaryDatas?.ward_name6);
    // } else {
    //   setValue("panchayat5", primaryDatas?.panchayat5);
    //   setValue("village6", primaryDatas?.village6);
    // }
   }

    
  }
  //const district3Value = watch("district3", "");

  const onSubmit = (wq_data) => {
    setShowLoader(true);
    console.log(wq_data);
    if (wq_data && Object.keys(wq_data).length > 0) {
      let sum = 0;

      // Loop through the object and add the value after replacing "ans_"
      for (const key in wq_data) {
          const value = wq_data[key].replace('ans_', ''); // Remove 'ans_' from the value
          sum += parseFloat(value); // Convert to float and add to the sum
      }
      console.log("Max Score: 15, Obtained:"+ sum);

      const mhmSurveyData=  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

      const updatedSurveyData = { ...mhmSurveyData, water_info: wq_data };
      saveallData(updatedSurveyData);



      saveScores("Water", { "max": 15, "got": sum });
      // const updatedData = {
      //   ...data, // existing data from the form
      // };
      ///console.log(updatedData);
      //saveSchoolPrimaryInfo(updatedData);
      showNotificationMsg("success", "Please Wait ...", {
        autoClose: 3000,
      });
      // setTimeout(() => {
      //   nav("/user/water");
      // }, 1500);

      const jsonObject = {
        udise_code: userinfos.udise_code,
        mobile: userinfos.mobile,
        columnname:"water_info" ,
        data: wq_data,
        columnname1:"scores" ,
        scores: "Water||15||"+sum
      };
      sessionStorage.setItem("water_info",JSON.stringify(wq_data));

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
    <div className="water-info-container">
      {showLoader && <Loader />}
      {/* <HeaderComponent /> */}
      <AuthMenu pageName="water_info" />
      <p className="water-info__heading">
      (Water Sanitation & Hygiene and Climate change and Environment sustainability )(जल स्वच्छता और स्वास्थ शिक्षा/ जलवायु परिवर्तन और पर्यावरणीय स्थिरता)
      <span className="water-info__marks">(15 Marks)</span>
      </p>

      <div className="water-info__content">
        <div className="water-info__form-container">

          <form
            // className={`rowx g-3 needs-validation `}
            className="water-form_form"
            autoComplete="off"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Question 1 */}
            
              <div className="water-form__question">
                <label htmlFor="wq1_source_drinking_water" className="water-form__label">
                  1. What is the main source of drinking water in the school? (please select the source used by most students in case of multiple drinking water sources)(विद्यालय में पीने के पानी का मुख्य स्रोत क्या है?)
                  {errors.wq1_source_drinking_water && (
                    <span className="error-message">
                      {errors.wq1_source_drinking_water.message}
                    </span>
                  )}
                </label>
                </div>
                    {/* <div className="col-md-4"> */}
                    <div className="water-form__options">
                      <div className="water-form__option">
                        <input
                          type="radio"
                          id="wq1_option1"
                          {...register("wq1_source_drinking_water", { required: "*" })}
                          value="ans_0.0"
                        />

                        {/* <input
                          className={`form-check-input ${
                            errors.wq1_source_drinking_water ? "border-danger" : ""
                          }`}
                          type="radio"
                          name="wq1_source_drinking_water"
                          {...register("wq1_source_drinking_water" , {
                            required: "*",
                          })}
                          id="wq1_source_drinking_water"
                          value="ans_0.0"
                        /> */}
                        <label
                          className="water-form__option-label"
                          htmlFor="wq1_option1"
                        >
                          No drinking water source available in school campus (students may bring water from home/ use outside source)( विद्यालय परिसर में कोई जल स्रोत उपलब्ध नहीं है (छात्र घर से पानी लाते हैं / बाहर के स्रोत का उपयोग करते हैं)) – (0.00)
                        </label>
                      </div>

                      <div className="water-form__option">
                        <input
                          className={`water-form__option-input ${
                            errors.wq1_source_drinking_water ? "border-danger" : ""
                          }`}
                          type="radio"
                          name="wq1_option2"
                          {...register("wq1_source_drinking_water" , {
                            required: "*",
                          })}
                          id="kgbv"
                          value="ans_0.25"
                        />
                        <label className="water-form__option-label" htmlFor="kgbv">
                        Unimproved Source: Unprotected- well/ spring, surface water: lake, river, stream, pond, canals, irrigation ditches – (0.25)(असुरक्षित स्रोत: बिना ढक्कन का कुआं / झरना, सतही जल: झील, नदी, नाला, तालाब, नहरें, सिंचाई खांचे) – (0.25)
                        </label>
                      </div>

                      <div className="water-form__option">
                        <input
                          className={`water-form__option-input ${
                            errors.wq1_source_drinking_water ? "border-danger" : ""
                          }`}
                          type="radio"
                          name="wq1_source_drinking_water"
                          {...register("wq1_source_drinking_water" , {
                            required: "*",
                          })}
                          id="nscbav"
                          value="ans_0.7"
                        />
                        <label className="water-form__option-label" htmlFor="nscbav">
                        Improved Source: Hand pump/ Boreholes/ tube wells or packaged water (bottled / sachet), protected- well/spring/ rainwater catchment/ harvesting (collection), Delivered water (Tanker/trucks /Cart with small tank / drum). – (0.70) (असुरक्षित स्रोत: हैंड पंप / बोरहोल्स / ट्यूबवेल या पैक किए गए पानी (बोतल / सैचेट), संरक्षित - कुआं / झरना / वर्षा जल संचयन / संग्रहण, जल आपूर्ति (टैंकर / ट्रक / छोटे टैंक / ड्रम)) – (0.70)
                        </label>
                      </div>

                      <div className="water-form__option">
                        <input
                          className={`water-form__optionk-input ${
                            errors.wq1_source_drinking_water ? "border-danger" : ""
                          }`}
                          type="radio"
                          name="wq1_source_drinking_water"
                          {...register("wq1_source_drinking_water" , {
                            required: "*",
                          })}
                          id="csoe"
                          value="ans_1.0"
                        />
                        <label className="water-form__option-label" htmlFor="csoe">
                        (d)	Piped Water Supply (पाइप जल आपूर्ति) – (1.00)
                          If (a) then questions 2-6 are Not applicable to your school. Go to question number 7 
                        (यदि (a) है, तो प्रश्न 2-6 आपके विद्यालय के लिए लागू नहीं हैं। प्रश्न संख्या 7 पर जाएं।)


                        </label>
                      </div>
                
              </div>
            
            {/* Qustion 2 */}
              <div className="water-form__question">
                <label htmlFor="wq2_adequate_water" className="water-form__label">
                  2. Is adequate drinking water (at least 1.5 litre per child per day in non-residential & 5 litre per child per day in residential school) available from this water supply, all days throughout the year? क्या इस जल आपूर्ति से पर्याप्त पीने का पानी (प्रतिदिन प्रति बच्चा कम से कम 1.5 लीटर गैर-आवासीय और 5 लीटर आवासीय विद्यालय में) सभी दिनों के लिए उपलब्ध है?)
                  {errors.wq2_adequate_water && (
                    <span className="error-message">
                      {errors.wq2_adequate_water.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq2_adequate_water ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq2_adequate_water"
                    {...register("wq2_adequate_water" , {
                      required: "*",
                    })}
                    id="primary1to5"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="primary1to5">
                  No, not available (unavailable more than 30 days total) –(0.00)(नहीं, उपलब्ध नहीं है (अनुपलब्ध  &lt 30 दिन कुल))  –(0.00)
                  </label>
                </div>

                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq2_adequate_water ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq2_adequate_water"
                    {...register("wq2_adequate_water" , {
                      required: "*",
                    })}
                    id="upperPrimary1to8"
                    value="ans_0.5"
                  />
                  <label
                    className="water-form__option-label"
                    htmlFor="upperPrimary1to8"
                  >
                   Mostly Available (unavailable less than or equal to 30 days total) – (0.50)(अधिकांशतः उपलब्ध है (अनुपलब्ध ≤ 30 दिन कुल))– (0.50)
                  </label>
                </div>

                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq2_adequate_water ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq2_adequate_water"
                    {...register("wq2_adequate_water" , {
                      required: "*",
                    })}
                    id="higherSecondary1to12"
                    value="ans_1.0"
                  />
                  <label
                    className="water-form__option-label"
                    htmlFor="higherSecondary1to12"
                  >
                   Yes (always) – (1.0)(हाँ (हमेशा))– (1.0)
                  </label>
                </div>
 
              </div>
            
            {/* Quetsion 3 */}
            
              <div className="water-form__question">
                <label htmlFor="wq2_drinking_water_handled_students" className="water-form__label">
                  3. How is drinking water stored and handled by most of the students? (अधिकांश छात्र पीने के पानी को कैसे स्टोर और हैंडल करते हैं?)
                  {errors.wq2_drinking_water_handled_students && (
                    <span className="error-message">
                      {errors.wq2_drinking_water_handled_students.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq2_drinking_water_handled_students ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="ans_0.0"
                    {...register("wq2_drinking_water_handled_students", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="water-form__option-label">No storage system for storing drinking (नहीं पीने के पानी के स्टोर करने के लिए कोई प्रणाली नहीं है)water – (0.00)</label>
                </div>

                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq2_drinking_water_handled_students ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="2-Girls"
                    {...register("wq2_drinking_water_handled_students", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="water-form__option-label">Container /pitcher only – (0.25)(केवल कंटेनर / घड़ा)</label>
                </div>

                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq2_drinking_water_handled_students ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="3-Co-ed"
                    {...register("wq2_drinking_water_handled_students", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="water-form__option-label">Container/pitcher with lid and ladle – (0.50)( कंटेनर / घड़ा ढक्कन और दब्बू के साथ)</label>
                </div>

                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq2_drinking_water_handled_students ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="3-Co-ed"
                    {...register("wq2_drinking_water_handled_students", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="water-form__option-label">Container with taps – (0.75)(कंटेनर में नल)– (0.75)</label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq2_drinking_water_handled_students ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="3-Co-ed"
                    {...register("wq2_drinking_water_handled_students", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="water-form__option-label">Overhead storage tank with drinking water taps – (1.00)(ऊपरी भंडारण टैंक के साथ पीने के पानी के नल) – (1.00)</label>
                </div>
              </div>
            
            {/* Question 4 */}
            
              <div className="water-form__question">
                <label
                  htmlFor="wq4_alt_source_water"
                  className="water-form__label"
                >
                  4. Does the school have an additional alternate functional water source(s) during the water scarcity periods?(क्या विद्यालय में जल संकट के दौरान वैकल्पिक क्रियाशील जल स्रोत(s) उपलब्ध हैं?)
                  {errors.wq4_alt_source_water  && (
                    <span className="error-message">
                      {errors.wq4_alt_source_water.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq4_alt_source_water ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq4_alt_source_water"
                    {...register("wq4_alt_source_water", {
                      required: "Please select one option",
                    })}
                    id="singleShift"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="singleShift">
                  Unavailable (0.00)(उपलब्ध नहीं है) 
                  </label>
                </div>

                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq4_alt_source_water ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq4_alt_source_water"
                    {...register("wq4_alt_source_water", {
                      required: "Please select one option",
                    })}
                    id="doubleShift"
                    value="ans_0.5"
                  />
                  <label className="water-form__option-label" htmlFor="doubleShift">
                  Partially available – (0.50)(आंशिक रूप से उपलब्ध) – (0.50)
                  </label>
                </div>

                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq4_alt_source_water ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq4_alt_source_water"
                    {...register("wq4_alt_source_water", {
                      required: "Please select one option",
                    })}
                    id="multipleSchools"
                    value="ans_1.0"
                  />
                  <label className="water-form__option-label" htmlFor="multipleSchools">
                  Fully available – (1.00)(पूरी तरह से उपलब्ध) – (1.00)
                  </label>
                </div> 
                 
              </div>
            
            {/* Question 5 */}
            
              <div className="water-form__question">
                <label
                  htmlFor="wq5_water_testing"
                  className="water-form__label"
                >
                  5. Whether the water testing done?(क्या जल परीक्षण किया जाता है?)
                  {errors.wq5_water_testing && (
                    <span className="error-message">
                      {errors.wq5_water_testing.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq5_water_testing ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq5_water_testing"
                    {...register("wq5_water_testing", {
                      required: "*",
                    })}
                    id="Rural_Area"
                    value="ans_1.0"
                  />
                  <label className="water-form__optionwater-form__option-label" htmlFor="Rural_Area">
                  Yes – (1.00) (हाँ) (1.00)
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                     className={`water-form__option-input ${
                      errors.wq5_water_testing ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq5_water_testing"
                    {...register("wq5_water_testing", {
                      required: "*",
                    })}
                    id="Urban_Area"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="Urban_Area">
                  No – (0.00)(नहीं)  (0.00) 
                  </label>
                </div>
              </div>
            
            {/* Question 6 */}
            
              <div className="water-form__question">
                <label htmlFor="village6" className="water-form__label">
                6. Is the quality of drinking water tested in laboratory on both chemical and bacteriological parameters?(क्या पीने के पानी की गुणवत्ता का परीक्षण रासायनिक और बैक्टीरियोलॉजिकल मानकों पर प्रयोगशाला में किया जाता है?)
                  {errors.wq6_water_tested_parameters && (
                    <span className="error-message">
                      {errors.wq6_water_tested_parameters.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
                <div className="water-form__option">
                  <input
                     className={`water-form__option-input ${
                      errors.wq6_water_tested_parameters ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq6_water_tested_parameters"
                    {...register("wq6_water_tested_parameters", {
                      required: "*",
                    })}
                    id="Residential"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="Residential">
                  No testing (0.00)(कोई परीक्षण नहीं) (0.00)
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq6_water_tested_parameters ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq6_water_tested_parameters"
                    {...register("wq6_water_tested_parameters", {
                      required: "*",
                    })}
                    id="Non-residential"
                    value="ans_0.25"
                  />
                  <label className="water-form__option-label" htmlFor="Non-residential">
                  Tested once a year on one parameter – (0.25)(एक बार एक मानक पर परीक्षण किया जाता है) – (0.25)
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq6_water_tested_parameters ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq6_water_tested_parameters"
                    {...register("wq6_water_tested_parameters", {
                      required: "*",
                    })}
                    id="Non-residential"
                    value="ans_0.5"
                  />
                  <label className="water-form__option-label" htmlFor="Non-residential">
                  Tested once a year on all parameters – (0.50)(एक बार सभी मानकों पर परीक्षण किया जाता है) – (0.50)
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq6_water_tested_parameters ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq6_water_tested_parameters"
                    {...register("wq6_water_tested_parameters", {
                      required: "*",
                    })}
                    id="Non-residential"
                    value="ans_0.75"
                  />
                  <label className="water-form__option-label" htmlFor="Non-residential">
                  Tested twice or more times in a year on either bacteriological or chemical parameters – (0.75)(वर्ष में दो या अधिक बार बैक्टीरियोलॉजिकल या रासायनिक मानकों पर परीक्षण किया जाता है)  – (0.75)
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq6_water_tested_parameters ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq6_water_tested_parameters"
                    {...register("wq6_water_tested_parameters", {
                      required: "*",
                    })}
                    id="Non-residential"
                    value="ans_1.0"
                  />
                  <label className="water-form__option-label" htmlFor="Non-residential">
                  Tested twice or more times in a year on both bacteriological and chemical parameters – (1.00)(वर्ष में दो या अधिक बार दोनों बैक्टीरियोलॉजिकल और रासायनिक मानकों पर परीक्षण किया जाता है)– (1.00)
                  </label>
                </div>
              </div>
            
            {/* Question 7 */}
            
              <div className="water-form__question">
                <label htmlFor="wq7_water_quality_report_prev_year" className="water-form__label">
                  7. Whether water quality testing reports is/ are available in school for last one year? (क्या पीने के पानी की गुणवत्ता परीक्षण रिपोर्ट पिछले एक वर्ष के लिए विद्यालय में उपलब्ध है?)
                  {errors.wq7_water_quality_report_prev_year && (
                    <span className="error-message">
                      {errors.wq7_water_quality_report_prev_year.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq7_water_quality_report_prev_year ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq7_water_quality_report_prev_year"
                    {...register("wq7_water_quality_report_prev_year", {
                      required: "*",
                    })}
                    id="CBSE_ICSE"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="CBSE_ICSE">
                  No – (0.00)(नहीं)  (0.00)                                             
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq7_water_quality_report_prev_year ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq7_water_quality_report_prev_year"
                    {...register("wq7_water_quality_report_prev_year", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_1.0"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Yes – (1.00) (हाँ) (1.00)
                  </label>
                </div>
                
              </div>
            
            {/* Question 8 */}
            
              <div className="water-form__question">
                <label htmlFor="wq8_functional_drinking_water_points" className="water-form__label">
                  8. How many functional drinking water points are there in the school??( विद्यालय में कितने क्रियाशील पीने के पानी के बिंदु हैं?) 
                  {errors.wq8_functional_drinking_water_points && (
                    <span className="error-message">
                      {errors.wq8_functional_drinking_water_points.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
              <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq8_functional_drinking_water_points ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq8_functional_drinking_water_points"
                    {...register("wq8_functional_drinking_water_points", {
                      required: "*",
                    })}
                    id="CBSE_ICSE"
                    value="ans_0.75"
                  />
                  <label className="water-form__option-label" htmlFor="CBSE_ICSE">
                  At least one per 50 students   - (0.75)(कम से कम प्रत्येक 50 छात्रों के लिए एक)  - (0.75)         
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq8_functional_drinking_water_points ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq8_functional_drinking_water_points"
                    {...register("wq8_functional_drinking_water_points", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_0.25"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Less than one per 50 students – (0.25)(प्रत्येक 50 छात्रों के लिए एक से कम) – (0.25)           
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq8_functional_drinking_water_points ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq8_functional_drinking_water_points"
                    {...register("wq8_functional_drinking_water_points", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_1.0"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  More than one per 50 students – (1.00)(प्रत्येक 50 छात्रों के लिए एक से अधिक) – (1.00)
                  </label>
                </div>
              </div>
            
            {/* Question 9 */}
            
              <div className="water-form__question">
                <label htmlFor="wq9_wastewater_management" className="water-form__label">
                 9. Do all the drinking water points have proper platforms, floor and drainage arrangement for wastewater, spillage?( क्या सभी पीने के पानी के बिंदुओं पर उचित प्लेटफॉर्म, फर्श और अपशिष्ट जल, फैलाव के लिए ड्रेनेज व्यवस्था है?)
                  {errors.wq9_wastewater_management && (
                    <span className="error-message">
                      {errors.wq9_wastewater_management.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
              <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq9_wastewater_management ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq9_wastewater_management"
                    {...register("wq9_wastewater_management", {
                      required: "*",
                    })}
                    id="CBSE_ICSE"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="CBSE_ICSE">
                  No – (0.00)(नहीं)  (0.00)                                       
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq9_wastewater_management ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq9_wastewater_management"
                    {...register("wq9_wastewater_management", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_1.0"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Yes – (1.00) (हाँ) (1.00)
                  </label>
                </div>
              </div>
            

            {/* Question 10 */}
            
              <div className="water-form__question">
                <label htmlFor="wq10_waterpoint_accesible_disaster" className="water-form__label">
                  10. Are all water points accessible, functional and safe to consume during flood, cyclone situation?( क्या सभी पानी के बिंदु बाढ़, चक्रवात की स्थिति में भी उपयुक्त, क्रियाशील और पीने योग्य हैं?)
                  {errors.wq10_waterpoint_accesible_disaster && (
                    <span className="error-message">
                      {errors.wq10_waterpoint_accesible_disaster.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
              <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq10_waterpoint_accesible_disaster ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq10_waterpoint_accesible_disaster"
                    {...register("wq10_waterpoint_accesible_disaster", {
                      required: "*",
                    })}
                    id="CBSE_ICSE"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="CBSE_ICSE">
                  No – (0.00)(नहीं)  (0.00) 
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq10_waterpoint_accesible_disaster ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq10_waterpoint_accesible_disaster"
                    {...register("wq10_waterpoint_accesible_disaster", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_1.00"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Yes - (1.00)(हाँ) - (1.00)                      
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq10_waterpoint_accesible_disaster ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq10_waterpoint_accesible_disaster"
                    {...register("wq10_waterpoint_accesible_disaster", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_0.5"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Partially   - (0.50)(आंशिक रूप से) - (0.50)       
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq10_waterpoint_accesible_disaster ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq10_waterpoint_accesible_disaster"
                    {...register("wq10_waterpoint_accesible_disaster", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_1.0"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Not applicable - (1.00)(लागू नहीं) - (1.00)                                
                  </label>
                </div>
              </div>
            
            {/* Question 11 */}
            
              <div className="water-form__question">
                <label htmlFor="wq11_water_source_in_toilet" className="water-form__label">
                  11. What is the main source of water for use in toilets?(शौचालयों के उपयोग के लिए पानी का मुख्य स्रोत क्या है?)
                  {errors.wq11_water_source_in_toilet && (
                    <span className="error-message">
                      {errors.wq11_water_source_in_toilet.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
              <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq11_water_source_in_toilet ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq11_water_source_in_toilet"
                    {...register("wq11_water_source_in_toilet", {
                      required: "*",
                    })}
                    id="Head_Master/ Head Mistress"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="Head_Master">
                  No water supplies available - (0.00)(जल आपूर्ति उपलब्ध नहीं है)- (0.00)                                
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq11_water_source_in_toilet ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq11_water_source_in_toilet"
                    {...register("wq11_water_source_in_toilet", {
                      required: "*",
                    })}
                    id="School_in_charge"
                    value="ans_0.5"
                  />
                  <label
                    className="water-form__option-label"
                    htmlFor="School_in_charge"
                  >
                    Hand pump/bucket/tap near toilet unit - (0.50)(शौचालय इकाई के पास हैंड पंप / बाल्टी / नल) - (0.50)                                
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq11_water_source_in_toilet ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq11_water_source_in_toilet"
                    {...register("wq11_water_source_in_toilet", {
                      required: "*",
                    })}
                    id="Teacher"
                    value="ans_0.75"
                  />
                  <label className="water-form__option-label" htmlFor="Teacher">
                  Drums/ cement tanks/ plastic containers with water inside the toilet unit  - (0.75)(शौचालय इकाई के अंदर ड्रम / सीमेंट टैंक / प्लास्टिक कंटेनर)  - (0.75)                                
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq11_water_source_in_toilet ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq11_water_source_in_toilet"
                    {...register("wq11_water_source_in_toilet", {
                      required: "*",
                    })}
                    id="respondent_designation"
                    value="ans_1.0"
                  />
                  <label
                    className="water-form__option-label"
                    htmlFor="respondent_designation"
                  >
                    Running water with taps inside each toilet unit - (1.00)(प्रत्येक शौचालय इकाई में पानी की आपूर्ति के साथ नल) - (1.00)                                
                  </label>
                </div>
              </div>
            
            {/* Question 12 */}
          
              <div className="water-form__question">
                <label
                  htmlFor="wq12_water_source_in_handwash"
                  className="water-form__label"
                >
                  12. What is the main source of water used for hand-washing after using toilets? (शौचालय का उपयोग करने के बाद हाथ धोने के लिए पानी का मुख्य स्रोत क्या है?)
                  {errors.wq12_water_source_in_handwash && (
                    <span className="error-message">
                      {errors.wq12_water_source_in_handwash.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
              <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq12_water_source_in_handwash ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq12_water_source_in_handwash"
                    {...register("wq12_water_source_in_handwash", {
                      required: "*",
                    })}
                    id="Head_Master/ Head Mistress"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="Head_Master">
                  No water - (0.00) (कोई पानी नहीं)- (0.00)                                
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq12_water_source_in_handwash ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq12_water_source_in_handwash"
                    {...register("wq12_water_source_in_handwash", {
                      required: "*",
                    })}
                    id="School_in_charge"
                    value="ans_0.25"
                  />
                  <label
                    className="water-form__option-label"
                    htmlFor="School_in_charge"
                  >
                   	Hand pump/bucket near hand washing area - (0.25)(हाथ धोने के क्षेत्र के पास हैंड पंप / बाल्टी) - (0.25)                                
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq12_water_source_in_handwash ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq12_water_source_in_handwash"
                    {...register("wq12_water_source_in_handwash", {
                      required: "*",
                    })}
                    id="Teacher"
                    value="ans_0.5"
                  />
                  <label className="water-form__option-label" htmlFor="Teacher">
                  Drums/ cement tanks/ plastic containers with water near hand washing area  - (0.50)( हाथ धोने के क्षेत्र के पास ड्रम / सीमेंट टैंक / प्लास्टिक कंटेनर) - (0.50)                                
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq12_water_source_in_handwash ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq12_water_source_in_handwash"
                    {...register("wq12_water_source_in_handwash", {
                      required: "*",
                    })}
                    id="respondent_designation"
                    value="ans_1.0"
                  />
                  <label
                    className="water-form__option-label"
                    htmlFor="respondent_designation"
                  >
                    Running water with taps at all the hand washing points- (1.00)(सभी हाथ धोने के बिंदुओं पर पानी के नल के साथ आपूर्ति)- (1.00)                                
                  </label>
                </div>
              </div>
            
            {/* Question 13 */}
            
              <div className="water-form__question">
                <label htmlFor="wq13_rainwater_used_for_drinking_other" className="water-form__label">
                  13. Whether the school use rainwater for drinking water and other purposes (like cooking, cleaning, washing, gardening and drinking after treatment)?(क्या विद्यालय वर्षा जल का उपयोग पीने के पानी और अन्य उद्देश्यों (जैसे खाना पकाने, सफाई, धोने, बागवानी और उपचार के बाद पीने) के लिए करता है?)
                  {/* {errors.wq13_rainwater_used_for_drinking_other && (
                    <span className="text-danger">
                      {errors.wq13_rainwater_used_for_drinking_other.message}
                    </span>
                  )}{" "} */}
                  {errors.wq13_rainwater_used_for_drinking_other && (
                    <span className="error-message">
                      {errors.wq13_rainwater_used_for_drinking_other.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
              <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq13_rainwater_used_for_drinking_other ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq13_rainwater_used_for_drinking_other"
                    {...register("wq13_rainwater_used_for_drinking_other", {
                      required: "*",
                    })}
                    id="CBSE_ICSE"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="CBSE_ICSE">
                  No – (0.00)(नहीं)  - (0.00)                   
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq13_rainwater_used_for_drinking_other ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq13_rainwater_used_for_drinking_other"
                    {...register("wq13_rainwater_used_for_drinking_other", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_1.0"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Yes – (1.00)(हाँ) - (1.00)                                
                  </label>
                </div>
              </div>
               
            
            {/* Question 14 */}
            
              <div className="water-form__question">
                <label
                  htmlFor="wq14_water_source_inspection_frequency"
                  className="water-form__label"
                >
                  14. How frequently school does inspection of the water source (including water points) in the school?(विद्यालय जल स्रोत का निरीक्षण कितनी बार करता है?)
                  {/* {errors.wq14_water_source_inspection_frequency && (
                    <span className="error-message">
                      {errors.wq14_water_source_inspection_frequency.message}
                    </span>
                  )} */}
                  {errors.wq14_water_source_inspection_frequency && (
                    <span className="error-message">
                      {errors.wq14_water_source_inspection_frequency.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
              <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq14_water_source_inspection_frequency ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq14_water_source_inspection_frequency"
                    {...register("wq14_water_source_inspection_frequency", {
                      required: "*",
                    })}
                    id="CBSE_ICSE"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="CBSE_ICSE">
                  Not done  - (0.00)(नहीं किया गया)- (0.00)                                         
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq14_water_source_inspection_frequency ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq14_water_source_inspection_frequency"
                    {...register("wq14_water_source_inspection_frequency", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_0.1"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Annually    - (0.10)(वार्षिक) - (0.10)                                         
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq14_water_source_inspection_frequency ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq14_water_source_inspection_frequency"
                    {...register("wq14_water_source_inspection_frequency", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_0.25"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Half Yearly   - (0.25)(छ: माह में एक बार)  - (0.25)                                       
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq14_water_source_inspection_frequency ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq14_water_source_inspection_frequency"
                    {...register("wq14_water_source_inspection_frequency", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_0.5"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Quarterly - (0.50)(त्रैमासिक)    - (0.50)                                   
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq14_water_source_inspection_frequency ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq14_water_source_inspection_frequency"
                    {...register("wq14_water_source_inspection_frequency", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_0.75"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Bi-Monthly  - (0.75) (दो माह में एक बार)  - (0.75)                                      
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq14_water_source_inspection_frequency ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq14_water_source_inspection_frequency"
                    {...register("wq14_water_source_inspection_frequency", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_0.9"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Monthly - (0.90)(मासिक)   - (0.90)                                                      
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq14_water_source_inspection_frequency ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq14_water_source_inspection_frequency"
                    {...register("wq14_water_source_inspection_frequency", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_1.0"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Weekly  - (1.00)(साप्ताहिक)  - (1.00)                                
                  </label>
                </div>
              </div>
              
            
            {/* Question 15 */}
            
              <div className="water-form__question">
                <label
                  htmlFor="wq15_water_awareness_conducted"
                  className="water-form__label"
                >
                  15. Has the school conducted local awareness drives on water conservation and management drive in the community/ locality?(क्या विद्यालय ने जल संरक्षण और प्रबंधन पर स्थानीय समुदाय में जागरूकता अभियान चलाया है?)
                  {/* {errors.wq15_water_awareness_conducted && (
                    <span className="error-message">
                      {errors.wq15_water_awareness_conducted.message}
                    </span>
                  )} */}
                  {errors.wq15_water_awareness_conducted && (
                    <span className="error-message">
                      {errors.wq15_water_awareness_conducted.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="water-form__options">
                <div className="water-form__option">
                  <input
                    className={`water-form__option-input ${
                      errors.wq15_water_awareness_conducted ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="wq15_water_awareness_conducted"
                    {...register("wq15_water_awareness_conducted", {
                      required: "*",
                    })}
                    id="CBSE_ICSE"
                    value="ans_0.0"
                  />
                  <label className="water-form__option-label" htmlFor="CBSE_ICSE">
                  No – (0.00)(नहीं)    - (0.00)                                                                                            
                  </label>
                </div>
                <div className="water-form__option">
                  <input
                  className={`water-form__option-input ${
                    errors.wq15_water_awareness_conducted ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="wq15_water_awareness_conducted"
                    {...register("wq15_water_awareness_conducted", {
                      required: "*",
                    })}
                    id="JAC"
                    value="ans_1.0"
                  />
                  <label className="water-form__option-label" htmlFor="JAC">
                  Yes – (1.00)(हाँ) - (1.00)                                
                  </label>
                </div>
              </div>
               
            
            <div className="water-form__submit">
              
              {hideFinal === false &&   <button
                type="submit"
                className="water-form__submit-btn"
                disabled={showLoader}
              >
                {showLoader ? "Submitting..." : "Submit"}
              </button>}
              
            </div>
          </form>
        </div>
      </div>
      {/* <FooterWithoutLogin /> */}
    </div>
  );
}