import React, { createContext, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
// import HeaderComponent from "../component/HeaderComponent";
// import FooterWithoutLogin from "../component/FooterWithoutLogin";
// import aboutBanner from "../images/aboutwash.png";
import "./Toilet.css"
import AuthMenu from "../AuthMenu";
import Loader from "../Loader";
import { apiJSONPost, parseJwtData } from "../../api/utility";
import { useForm, Controller } from "react-hook-form";
import { showNotificationMsg } from "../../api/common";
import { useNavigate } from "react-router-dom";

export default function Toilet() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");
  // const [hidePanchayat, sethidePanchayat] = useState(false);
  // const [hideVillage, sethideVillage] = useState(false);

  // const [showUrbanBodyName, setshowUrbanBodyName] = useState(false);
  // const [showWardName, setshowWardName] = useState(false);

  const { token,allSurveyData,saveScores,scores,saveallData  } = useAuth();
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
      setuserinfos(parseJwtData(token));
      const parsedData =  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
      if(parsedData?.toilet_info){
        PreFillData(parsedData);
      }
    }
    setShowLoader(false);
  }, [token]);


  const PreFillData =(allSurveyData)=>{  
     let primaryDatas = allSurveyData?.toilet_info;
     console.log(primaryDatas); 
       primaryDatas =  (typeof primaryDatas === 'string') ? JSON.parse(primaryDatas) : primaryDatas;
     primaryDatas &&  Object.keys(primaryDatas).forEach((key) => {
      setValue(key, primaryDatas[key]); // Set value for the respective form field
    });
    // if (primaryDatas?.location_school_urbanrural11 === "2-Urban") {
       
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
  //const district3Value = watch("district3", "");

  const onSubmit = (toilet_data) => {
    setShowLoader(true);
    if (toilet_data && Object.keys(toilet_data).length > 0) {
       
       console.log(toilet_data);

       let sum = 0;

       // Loop through the object and add the value after replacing "ans_"
       for (const key in toilet_data) {
           const value = toilet_data[key].replace('ans_', ''); // Remove 'ans_' from the value
           sum += parseFloat(value); // Convert to float and add to the sum
       }
       console.log("Max Score: 15, Obtained:"+ sum);

       const mhmSurveyData=  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

       const updatedSurveyData = { ...mhmSurveyData, toilet_info: toilet_data };
       saveallData(updatedSurveyData);



       saveScores("Toilet", { "max": 15, "got": sum });

     // saveSchoolPrimaryInfo(updatedData);
      showNotificationMsg("success", "Please Wait ...", {
        autoClose: 3000,
      });
      // setTimeout(() => {
      //   nav("/user/water");
      // }, 1500);

      const jsonObject = {
        udise_code: userinfos.udise_code,
        mobile: userinfos.mobile,
        columnname:"toilet_info" ,
        data: toilet_data,
        columnname1:"scores" ,
        scores: "Toilet||15||"+sum
      };

      sessionStorage.setItem("toilet_info",JSON.stringify(toilet_data));
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

  // const handleGetSchoolInfos = (e) => {
  //   if (e.target.value.length === 11) {
  //     setShowLoader(true);
  //     const udiseCode = e.target.value;
  //     const data = { udise_code: udiseCode };
  //     sethidePanchayat(false);
  //     sethideVillage(false);
  //     setshowUrbanBodyName(false);
  //     setshowWardName(false);
  //     getSchoolData("getSchoolInfos.php", JSON.stringify(data));
  //   }
  // };
  // const getSchoolData = async (endpoint, jsonData) => {
  //   try {
  //     const response = await apiJSONPost(endpoint, jsonData);
  //     console.log(response);
  //     if (
  //       response?.data?.statuscode === 200 &&
  //       response?.data?.title === "Success"
  //     ) {
  //       if (typeof response?.data?.message === "object") {
  //         showNotificationMsg("success", "Please Wait ...", {
  //           autoClose: 3000,
  //         });
  //         setValue("school_name2", response?.data?.message?.school_name);
  //         setValue("district3", response?.data?.message?.district_name);
  //         setValue("block4", response?.data?.message?.block_name);

  //         if (response?.data?.message?.school_location === "2-Urban") {
  //           alert("School Urban");
  //           sethidePanchayat(true);
  //           sethideVillage(true);
  //           setshowUrbanBodyName(true);
  //           setshowWardName(true);
  //           setValue(
  //             "urban_body_name5",
  //             response?.data?.message?.lgd_urban_local_body_name
  //           );
  //           setValue("ward_name6", response?.data?.message?.lgd_ward_name);
  //         } else {
  //           setValue("panchayat5", response?.data?.message?.lgd_panchayat_name);
  //           setValue("village6", response?.data?.message?.lgd_vill_name);
  //         }
  //         setValue("school_category7", response?.data?.message?.management);
  //         setValue("school_category8", response?.data?.message?.category);
  //         setValue(
  //           "type_school9",
  //           response?.data?.message?.type === "3-Co-ed"
  //             ? response?.data?.message?.type
  //             : ""
  //         );

  //         setValue(
  //           "use_school_premises10",
  //           response?.data?.message?.use_school_premises === null? "Single School - Single shift": response?.data?.message?.use_school_premises
  //         );
  //         setValue(
  //           "location_school_urbanrural11",
  //           response?.data?.message?.school_location
  //         );
  //         setValue(
  //           "school_type_use12",
  //           response?.data?.message?.school_location
  //         );
  //         setValue(
  //           "Longitude",
  //           response?.data?.message?.longitude
  //         );
  //         setValue(
  //           "Latitude",
  //           response?.data?.message?.latitude
  //         );
  //         setValue(
  //           "name_respondent17",
  //           userinfos?.respondant_name
  //         ); 
  //         setValue(
  //           "designation_respondent18",
  //           userinfos?.designation
  //         );
  //         setValue(
  //           "contact_respondent_mobile",
  //           userinfos?.mobile
  //         );
           
  //         //setValue("location_school_urbanrural11", response?.data?.message?.location_school_ulb);
  //         //setValue("school_category7", response?.data?.message?.management);
  //       } else {
  //         showNotificationMsg("error", response?.data?.message, {
  //           autoClose: 3000,
  //         });
  //       }

  //       if (response?.data?.token !== null) {
  //       }
  //     } else {
  //       showNotificationMsg("error", response?.data?.message, {
  //         autoClose: 3000,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error posting data:", error);
  //     if (error?.response?.status === (400 || 404)) {
  //       showNotificationMsg("error", error?.response?.data, {
  //         autoClose: 3000,
  //       });
  //     } else if (error?.response?.status === 401) {
  //       showNotificationMsg("error", error?.response?.data, {
  //         autoClose: 3000,
  //       });
  //     } else if (error?.response?.status === 500) {
  //       showNotificationMsg("error", error?.response?.data, {
  //         autoClose: 3000,
  //       });
  //     }
  //   }
  //   setShowLoader(false);
  // };
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
      {/* <HeaderComponent /> */}
      <AuthMenu pageName="toilet_info" />
      <p className="text-center">
      <span className="d-block text-primary fw-bold">(15 Marks)</span>
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
                <label htmlFor="tq1_separate_toilet_boys_girls" className="col-form-label">
                  1. Does the school have separate toilets for boys and girls in working condition?(क्या विद्यालय में बालकों एवं बालिकाओं  के लिए क्रियाशील  शौचालय हैं?)
                  {errors.tq1_separate_toilet_boys_girls && (
                    <span className="text-danger">
                      {errors.tq1_separate_toilet_boys_girls.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.tq1_separate_toilet_boys_girls ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="tq1_separate_toilet_boys_girls"
                    {...register("tq1_separate_toilet_boys_girls" , {
                      required: "*",
                    })}
                    id="tq1_separate_toilet_boys_girls"
                    value="ans_0.0"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="tq1_separate_toilet_boys_girls"
                  >
                    There are no toilet units for either boys and girls in the school - (0.00)(विद्यालय में बालकों एवं बालिकाओं  के लिए कोई शौचालय नहीं है) - (0.00)                                
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.tq1_separate_toilet_boys_girls ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="tq1_separate_toilet_boys_girls"
                    {...register("tq1_separate_toilet_boys_girls" , {
                      required: "*",
                    })}
                    id="kgbv"
                    value="ans_0.25"
                  />
                  <label className="form-check-label" htmlFor="kgbv">
                  If coeducation, the same toilet unit is used by boys and girls  - (0.25)(यदि सह-शिक्षा है, तो बालक एवं बालिकएँ  एक ही शौचालय का उपयोग करते हैं)  - (0.25)                                
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.tq1_separate_toilet_boys_girls ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="tq1_separate_toilet_boys_girls"
                    {...register("tq1_separate_toilet_boys_girls" , {
                      required: "*",
                    })}
                    id="nscbav"
                    value="ans_2.0"
                  />
                  <label className="form-check-label" htmlFor="nscbav">
                  The all boys/ all girls school has toilet units - (2.00) (सभी बालकों / सभी बालिकाओं के लिए विद्यालय में शौचालय हैं) - (2.00)                                
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.tq1_separate_toilet_boys_girls ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="tq1_separate_toilet_boys_girls"
                    {...register("tq1_separate_toilet_boys_girls" , {
                      required: "*",
                    })}
                    id="csoe"
                    value="ans_2.0"
                  />
                  <label className="form-check-label" htmlFor="csoe">
                  If  co-education, there is at least one toilet unit each for boys and girls  - (2.00)(यदि सह-शिक्षा है, तो बालकों एवं बालिकाओं  के लिए कम से कम एक शौचालय यूनिट है)  - (2.00)                                
                  </label>
                </div>
 
              </div>
              </div>

              <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="tq2_type_toilet_available"
                  className="col-form-label"
                >
                  2. What is the most common type of toilet used by the students at the school?(विद्यालय में छात्रों द्वारा उपयोग किए जाने वाले शौचालय का सबसे सामान्य प्रकार क्या है?)
                  {errors.tq2_type_toilet_available  && (
                    <span className="text-danger">
                      {errors.tq2_type_toilet_available.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.tq2_type_toilet_available ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="tq2_type_toilet_available"
                    {...register("tq2_type_toilet_available", {
                      required: "Please select one option",
                    })}
                    id="singleShift"
                    value="ans_0.0"
                  />
                  <label className="form-check-label" htmlFor="singleShift">
                  Unimproved Latrine: Pit latrine without slab, Hanging latrine (toilet seat/ squaƫ ng plate over drain or a water body), Bucket latrine - (0.00)(असुरक्षित शौचालय: पिट शौचालय जिसमें स्लैब नहीं है, हैंगिंग शौचालय (नाली या जल निकाय के ऊपर शौचालय सीट/ squatting प्लेट), बाल्टी शौचालय) - (0.00)                                
                  </label>
                </div> 
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.tq2_type_toilet_available ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="tq2_type_toilet_available"
                    {...register("tq2_type_toilet_available", {
                      required: "Please select one option",
                    })}
                    id="multipleSchools"
                    value="ans_1.0"
                  />
                  <label className="form-check-label" htmlFor="multipleSchools">
                  Improved Latrine: Flush / Pour fl ush toilets, Pit latrines with slab (at least 50 mm water seal must be in pan of latrine), Composting toilets - (1.00)(सुरक्षित शौचालय: फ्लश / पोर फ्लश शौचालय, पिट शौचालय जिसमें स्लैब (कम से कम 50 मिमी पानी की सील पैन में होनी चाहिए), कंपोस्टिंग शौचालय) - (1.00)                                
                  </label>
                </div> 
                 
              </div>
              </div>

              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq3_type_toilet_available"
                    className="col-form-label"
                  >
                    3. How many toilets seats in working condition does the school have for boys and girls??( विद्यालय में बालकों एवं बालिकाओं  के लिए क्रियाशील शौचालय सीटों की संख्या कितनी है?)
                    {errors.tq3_type_toilet_available  && (
                      <span className="text-danger">
                        {errors.tq3_type_toilet_available.message}
                      </span>
                    )}
                  </label>
                </div>
                <div className="col-md-2"> 
                    <div className="input-group mb-3">
                        <span className="input-group-text" id="basic-addon1">Boys</span>
                        <input  autoComplete="off"
                    className={`form-control ${
                      errors.tq3_type_toilet_available ? "border-danger" : ""
                    }`}
                    type="text"
                    {...register("tq3_type_toilet_available", {
                      required: "*",
                    })} placeholder="Enter toilets seats" aria-describedby="basic-addon1" />
                      </div>
                </div> 
                <div className="col-md-2"> 
                    <div className="input-group mb-3">
                        <span className="input-group-text" id="basic-addon1">Girls</span>
                        <input  autoComplete="off"
                    className={`form-control ${
                      errors.tq3_type_toilet_available ? "border-danger" : ""
                    }`}
                    type="text"
                    {...register("tq3_type_toilet_available", {
                      required: "*",
                    })} placeholder="Enter toilets seats"  aria-describedby="basic-addon1"/>
                      </div>
                </div> 
              </div>

              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq4_urinal_available"
                    className="col-form-label"
                  >
                    4. How many urinals does the school have for boys and girls?( विद्यालय में लड़कों और लड़कियों के लिए कितने यूरिनल (मूत्रालय) हैं?)
                    {errors.tq4_urinal_available  && (
                      <span className="text-danger">
                        {errors.tq4_urinal_available.message}
                      </span>
                    )}
                  </label>
                </div>
                <div className="col-md-2"> 
                    <div className="input-group mb-3">
                        <span className="input-group-text" id="basic-addon1">Boys</span>
                        <input  autoComplete="off"
                    className={`form-control ${
                      errors.tq4_urinal_available ? "border-danger" : ""
                    }`}
                    type="text"
                    {...register("tq4_urinal_available", {
                      required: "*",
                    })} placeholder="Enter urinals " aria-describedby="basic-addon1" />
                      </div>
                </div> 
                <div className="col-md-2"> 
                    <div className="input-group mb-3">
                        <span className="input-group-text" id="basic-addon1">Girls</span>
                        <input  autoComplete="off"
                    className={`form-control ${
                      errors.tq4_urinal_available ? "border-danger" : ""
                    }`}
                    type="text"
                    {...register("tq4_urinal_available", {
                      required: "*",
                    })} placeholder="Enter urinals"  aria-describedby="basic-addon1"/>
                      </div>
                </div> 
              </div>

              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq5_toilet_disabled_child"
                    className="col-form-label"
                  >
                    5. Does the school have toilets for Children with Disability?(क्या विद्यालय में दिव्यांग बच्चों के लिए शौचालय हैं?)
                    {errors.tq5_toilet_disabled_child  && (
                      <span className="text-danger">
                        {errors.tq5_toilet_disabled_child.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                    <div className="form-check">
                      <input
                        className={`form-check-input ${
                          errors.tq5_toilet_disabled_child ? "border-danger" : ""
                        }`}
                        type="radio"
                        name="tq5_toilet_disabled_child"
                        {...register("tq5_toilet_disabled_child" , {
                          required: "*",
                        })}
                        id="tq5_toilet_disabled_child"
                        value="ans_0.0"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="tq5_toilet_disabled_child"
                      >
                       Toilets are not accessible by Children with Disability - (0.00)(दिव्यांग बच्चों के लिए शौचालय सुलभ नहीं हैं) - (0.00)                                
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className={`form-check-input ${
                          errors.tq5_toilet_disabled_child ? "border-danger" : ""
                        }`}
                        type="radio"
                        name="tq5_toilet_disabled_child"
                        {...register("tq5_toilet_disabled_child" , {
                          required: "*",
                        })}
                        id="kgbv"
                        value="ans_0.5"
                      />
                      <label className="form-check-label" htmlFor="kgbv">
                      There is  at least one toilet that is accessible to Children with Disability - (0.50)(कम से कम एक शौचालय है जो दिव्यांग बच्चों के लिए सुलभ है)- (0.50)                                
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className={`form-check-input ${
                          errors.tq5_toilet_disabled_child ? "border-danger" : ""
                        }`}
                        type="radio"
                        name="tq5_toilet_disabled_child"
                        {...register("tq5_toilet_disabled_child" , {
                          required: "*",
                        })}
                        id="nscbav"
                        value="ans_0.75"
                      />
                      <label className="form-check-label" htmlFor="nscbav">
                      There is at least one separate toilet for Children with Disability with ramp and handrail - (0.75) (कम से कम एक अलग शौचालय दिव्यांग बच्चों के लिए है जिसमें रैंप और हैंडरेल है - (0.75)       
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className={`form-check-input ${
                          errors.tq5_toilet_disabled_child ? "border-danger" : ""
                        }`}
                        type="radio"
                        name="tq5_toilet_disabled_child"
                        {...register("tq5_toilet_disabled_child" , {
                          required: "*",
                        })}
                        id="csoe"
                        value="ans_1.0"
                      />
                      <label className="form-check-label" htmlFor="csoe">
                      The school has at least one separate toilet for Children with Disability with ramp, handrail, wide door for wheelchair entry and support structure inside toilet. - (1. 00)	(An accessible toilet for Children with Disability, is one that if there is a functional toilet with ramp, handrail, and wide door for wheelchair entry inside toilet).( विद्यालय में कम से कम एक अलग शौचालय दिव्यांग बच्चों के लिए है जिसमें रैंप, हैंडरेल, व्हीलचेयर के लिए चौड़ा दरवाजा और शौचालय के अंदर सहायक संरचना है) - (1.00)           
                      </label>
                    </div>
                </div> 
              </div>

              <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="tq6_toilet_size_all_age_group"
                  className="col-form-label"
                >
                  6. Is the height and size of toilet and urinal facilities suitable for children of all age groups in the school?(क्या शौचालय और यूरिनल सुविधाओं की ऊंचाई और आकार विद्यालय के सभी आयु वर्ग के बच्चों के लिए उपयुक्त हैं?)
                  {errors.tq6_toilet_size_all_age_group  && (
                    <span className="text-danger">
                      {errors.tq6_toilet_size_all_age_group.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.tq6_toilet_size_all_age_group ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="tq6_toilet_size_all_age_group"
                    {...register("tq6_toilet_size_all_age_group", {
                      required: "Please select one option",
                    })}
                    id="singleShift"
                    value="ans_0.0"
                  />
                  <label className="form-check-label" htmlFor="singleShift">
                  No - (0.00)(नहीं) - (0.00)                                
                  </label>
                </div> 
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.tq6_toilet_size_all_age_group ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="tq6_toilet_size_all_age_group"
                    {...register("tq6_toilet_size_all_age_group", {
                      required: "Please select one option",
                    })}
                    id="multipleSchools"
                    value="ans_1.0"
                  />
                  <label className="form-check-label" htmlFor="multipleSchools">
                  Yes - (1.00)(हाँ) - (1.00)                                
                  </label>
                </div> 
                 
              </div>
              </div>
             
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq7_toilet_staff_teacher"
                    className="col-form-label"
                  >
                    7. Does the school have separate toilets for Teachers and Staff?(क्या विद्यालय में शिक्षकों और कर्मचारियों के लिए अलग शौचालय हैं?)
                    {errors.tq7_toilet_staff_teacher  && (
                      <span className="text-danger">
                        {errors.tq7_toilet_staff_teacher.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq7_toilet_staff_teacher ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq7_toilet_staff_teacher"
                      {...register("tq7_toilet_staff_teacher", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No toilet - (0.00)(कोई शौचालय नहीं है) - (0.00)                                
                    </label>
                  </div> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq7_toilet_staff_teacher ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq7_toilet_staff_teacher"
                      {...register("tq7_toilet_staff_teacher", {
                        required: "Please select one option",
                      })}
                      id="multipleSchools"
                      value="ans_0.75"
                    />
                    <label className="form-check-label" htmlFor="multipleSchools">
                    There is one separate toilet for use by teachers and staff  - (0.75)(शिक्षकों और कर्मचारियों के उपयोग के लिए एक अलग शौचालय है) - (0.75)                                
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq7_toilet_staff_teacher ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq7_toilet_staff_teacher"
                      {...register("tq7_toilet_staff_teacher", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    There are separate toilets for male and female teachers/ staff - (1.00)(पुरुष और महिला शिक्षकों/कर्मचारियों के लिए अलग शौचालय हैं –)- (1.00)                                
                    </label>
                  </div> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq7_toilet_staff_teacher ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq7_toilet_staff_teacher"
                      {...register("tq7_toilet_staff_teacher", {
                        required: "Please select one option",
                      })}
                      id="multipleSchools"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="multipleSchools">
                    Teachers and staff use the toilets meant for students - (1.00)(शिक्षक और कर्मचारी छात्रों के लिए बनाए गए शौचालयों का उपयोग करते हैं) - (1.00)                                
                    </label>
                  </div>
                </div> 
              </div>
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq8_toilets_with_securedoor_hanginghooks"
                    className="col-form-label"
                  >
                    8. Do all the toilets in the school have secure door with latch and cloth hanging hooks?(क्या विद्यालय के सभी शौचालयों में सुरक्षित दरवाजा और लैच के साथ कपड़े टांगने के हुक हैं?)
                    {errors.tq8_toilets_with_securedoor_hanginghooks  && (
                      <span className="text-danger">
                        {errors.tq8_toilets_with_securedoor_hanginghooks.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq8_toilets_with_securedoor_hanginghooks ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq8_toilets_with_securedoor_hanginghooks"
                      {...register("tq8_toilets_with_securedoor_hanginghooks", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No toilet - (0.00)(नहीं) - (0.00)                                
                    </label>
                  </div> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq8_toilets_with_securedoor_hanginghooks ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq8_toilets_with_securedoor_hanginghooks"
                      {...register("tq8_toilets_with_securedoor_hanginghooks", {
                        required: "Please select one option",
                      })}
                      id="multipleSchools"
                      value="ans_0.5"
                    />
                    <label className="form-check-label" htmlFor="multipleSchools">
                    Door with latch/bolt only - (0.50)(केवल लैच/बोल्ट वाला दरवाजा) - (0.50)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq8_toilets_with_securedoor_hanginghooks ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq8_toilets_with_securedoor_hanginghooks"
                      {...register("tq8_toilets_with_securedoor_hanginghooks", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Door with latch/bolt  and cloth hanging hooks - (1.00)(लैच/बोल्ट वाला दरवाजा और कपड़े टांगने के हुक) - (1.00)                                
                    </label>
                  </div> 
                 
                </div> 
              </div>

              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq9_toilets_with_roof_ventilation"
                    className="col-form-label"
                  >
                    9. Do all the toilets (water closet) have roof and proper ventilation for natural light and air?(क्या सभी शौचालयों (वाटर क्लोजेट) में प्राकृतिक रोशनी और हवा के लिए उचित वेंटिलेशन और छत है?)
                    {errors.tq9_toilets_with_roof_ventilation  && (
                      <span className="text-danger">
                        {errors.tq9_toilets_with_roof_ventilation.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq9_toilets_with_roof_ventilation ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq9_toilets_with_roof_ventilation"
                      {...register("tq9_toilets_with_roof_ventilation", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No - (0.00)(नहीं) - (0.00)                                
                    </label>
                  </div> 
                  
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq9_toilets_with_roof_ventilation ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq9_toilets_with_roof_ventilation"
                      {...register("tq9_toilets_with_roof_ventilation", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Yes - (1.00)  (हाँ) - (1.00)                                
                    </label>
                  </div> 
                 
                </div> 
              </div>
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq10_dustbin_menstrual_waste"
                    className="col-form-label"
                  >
                    10. Does the school have separate dustbins with lid and with specific colors for disposal of menstrual waste for disposal of sanitary waste?(क्या विद्यालय में मासिक धर्म अपशिष्ट के निपटान के लिए lid वाला अलग डस्टबिन और विशिष्ट रंग होते हैं?)
                    {errors.tq10_dustbin_menstrual_waste  && (
                      <span className="text-danger">
                        {errors.tq10_dustbin_menstrual_waste.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq10_dustbin_menstrual_waste ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq10_dustbin_menstrual_waste"
                      {...register("tq10_dustbin_menstrual_waste", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No - (0.00)(नहीं)  - (0.00)                                
                    </label>
                  </div> 
                  
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq10_dustbin_menstrual_waste ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq10_dustbin_menstrual_waste"
                      {...register("tq10_dustbin_menstrual_waste", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Yes - (1.00)  (हाँ)  - (1.00)                                
                    </label>
                  </div> 
                 
                </div> 
              </div>

              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq11_toilet_fecal_management"
                    className="col-form-label"
                  >
                    11. What is the main mechanism for disposal of toilet waste / fecal sludge?(शौचालय अपशिष्ट / मल-निरोध का मुख्य निपटान तरीका क्या है?)
                    {errors.tq11_toilet_fecal_management  && (
                      <span className="text-danger">
                        {errors.tq11_toilet_fecal_management.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq11_toilet_fecal_management ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq11_toilet_fecal_management"
                      {...register("tq11_toilet_fecal_management", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No specific measure / sludge dumped in open - (0.00)(नहींकोई विशिष्ट उपाय नहीं / मल को खुले में डाला जाता है)- (0.00)                                
                    </label>
                  </div> 
                  
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq11_toilet_fecal_management ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq11_toilet_fecal_management"
                      {...register("tq11_toilet_fecal_management", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.25"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Toilet connected to an open drain - (0.25)(शौचालय खुले नाले से जुड़ा हुआ है) - (0.25)                                
                    </label>
                  </div> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq11_toilet_fecal_management ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq11_toilet_fecal_management"
                      {...register("tq11_toilet_fecal_management", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.25"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Septic tanks without cover or broken cover  - (0.25) (सेप्टिक टैंक जिसमें ढकने के लिए कवर नहीं है या टूटा हुआ कवर है)   - (0.25)                                
                    </label>
                  </div> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq11_toilet_fecal_management ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq11_toilet_fecal_management"
                      {...register("tq11_toilet_fecal_management", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.75"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Leach pits with sturdy and solid cover (prevents contact with flies/accidental overspill) - (0.75)   (लीच पिट जिसमें मजबूत और ठोस कवर (मच्छरों के संपर्क को रोकने के लिए / दुर्घटनावश बहाव से बचने के लिए)) - (0.75)                                
                    </label>
                  </div> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq11_toilet_fecal_management ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq11_toilet_fecal_management"
                      {...register("tq11_toilet_fecal_management", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Septic tank/bio-toilets/ sewer line with sturdy and solid cover - (1.00)(सेप्टिक टैंक / बायो-टॉयलेट्स / सीवरेज लाइन जिसमें मजबूत और ठोस कवर है) - (1.00)                                
                    </label>
                  </div> 
                 
                </div> 
              </div>

              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq9_toilets_with_roof_ventilation"
                    className="col-form-label"
                  >
                    9. Do all the toilets (water closet) have roof and proper ventilation for natural light and air?(क्या सभी शौचालयों (वाटर क्लोजेट) में प्राकृतिक रोशनी और हवा के लिए उचित वेंटिलेशन और छत है?)
                    {errors.tq9_toilets_with_roof_ventilation  && (
                      <span className="text-danger">
                        {errors.tq9_toilets_with_roof_ventilation.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq9_toilets_with_roof_ventilation ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq9_toilets_with_roof_ventilation"
                      {...register("tq9_toilets_with_roof_ventilation", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No - (0.00)(नहीं) - (0.00)                                
                    </label>
                  </div> 
                  
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq9_toilets_with_roof_ventilation ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq9_toilets_with_roof_ventilation"
                      {...register("tq9_toilets_with_roof_ventilation", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Yes - (1.00) (हाँ) - (1.00)                                 
                    </label>
                  </div> 
                 
                </div> 
              </div>
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq12_scheduled_desludging_before_monsoon"
                    className="col-form-label"
                  >
                    12. Does the school have scheduled desludging of the faecal matter (preferably before monsoon), in coordination with nearby service provider?(क्या विद्यालय में मासिक धर्म अपशिष्ट के निपटान के लिए lid वाला अलग डस्टबिन और विशिष्ट रंग होते हैं?)
                    {errors.tq12_scheduled_desludging_before_monsoon  && (
                      <span className="text-danger">
                        {errors.tq12_scheduled_desludging_before_monsoon.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq12_scheduled_desludging_before_monsoon ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq12_scheduled_desludging_before_monsoon"
                      {...register("tq12_scheduled_desludging_before_monsoon", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No - (0.00)(नहीं)  - (0.00)                                
                    </label>
                  </div> 
                  
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq12_scheduled_desludging_before_monsoon ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq12_scheduled_desludging_before_monsoon"
                      {...register("tq12_scheduled_desludging_before_monsoon", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Yes - (1.00)  (हाँ)  - (1.00)                                
                    </label>
                  </div>  
                </div> 
              </div>

              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq12_scheduled_desludging_before_monsoon"
                    className="col-form-label"
                  >
                    13. Has the school cleared/demolished/disposed of the old dilapidated non-usable toilet blocks with appropriate permission from officials?(क्या विद्यालय ने पुरानी, जर्जर और अनुपयोगी शौचालय ब्लॉकों को उचित अनुमति के साथ नष्ट/हटाया/नष्ट किया है?)
                    {errors.tq13_disposal_old_toilet_block  && (
                      <span className="text-danger">
                        {errors.tq13_disposal_old_toilet_block.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq13_disposal_old_toilet_block ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq13_disposal_old_toilet_block"
                      {...register("tq13_disposal_old_toilet_block", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No - (0.00)(नहीं) - (0.00)                                
                    </label>
                  </div> 
                  
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq13_disposal_old_toilet_block ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq13_disposal_old_toilet_block"
                      {...register("tq13_disposal_old_toilet_block", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Yes - (1.00)  (हाँ) - (1.00)                                
                    </label>
                  </div> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq13_disposal_old_toilet_block ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq13_disposal_old_toilet_block"
                      {...register("tq13_disposal_old_toilet_block", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Not applicable/ required - (1.00)(लागू नहीं/आवश्यकता है)- (1.00)                                
                    </label>
                  </div>   
                </div> 
              </div>

              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq14_ventilation_light_air"
                    className="col-form-label"
                  >
                    14. Does the school's toilet have adequate ventilation for natural light and air?(क्या विद्यालय के शौचालयों में उचित वेंटिलेशन है ताकि प्राकृतिक रोशनी और हवा मिल सके?)
                    {errors.tq14_ventilation_light_air  && (
                      <span className="text-danger">
                        {errors.tq14_ventilation_light_air.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq14_ventilation_light_air ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq14_ventilation_light_air"
                      {...register("tq14_ventilation_light_air", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No - (0.00)(नहीं) - (0.00)                          
                    </label>
                  </div>  
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq14_ventilation_light_air ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq14_ventilation_light_air"
                      {...register("tq14_ventilation_light_air", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Yes - (1.00)  (हाँ) - (1.00)                                
                    </label>
                  </div>  
                </div> 
              </div>
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq15_regular_maintenance"
                    className="col-form-label"
                  >
                    15. Does the school undertake timely upkeeping/maintenance of fitting and fixtures of toilets?(क्या विद्यालय, समय पर शौचालय की फिटिंग और फिक्सचर की देखभाल करता है?)
                    {errors.tq15_regular_maintenance  && (
                      <span className="text-danger">
                        {errors.tq15_regular_maintenance.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq15_regular_maintenance ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq15_regular_maintenance"
                      {...register("tq15_regular_maintenance", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No - (0.00)(नहीं)  - (0.00)                                                                                                 
                    </label>
                  </div>  
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq15_regular_maintenance ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq15_regular_maintenance"
                      {...register("tq15_regular_maintenance", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Yes - (1.00)  (हाँ) - (1.00)                                
                    </label>
                  </div>  
                </div> 
              </div>
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label
                    htmlFor="tq16_toilet_pit_sanitation"
                    className="col-form-label"
                  >
                    16. Does the school (with onsite sanitation facility) ensure that the toilet leach pit is at a safe distance from the ground and main water source?(क्या विद्यालय (ऑन-साइट शौचालय सुविधा के साथ) यह सुनिश्चित करता है कि शौचालय लीच पिट मुख्य जल स्रोत और भूमि से सुरक्षित दूरी पर हो?)
                    {errors.tq16_toilet_pit_sanitation  && (
                      <span className="text-danger">
                        {errors.tq16_toilet_pit_sanitation.message}
                      </span>
                    )}
                  </label>
                </div> 
                <div className="col-md-4"> 
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq16_toilet_pit_sanitation ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq16_toilet_pit_sanitation"
                      {...register("tq16_toilet_pit_sanitation", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_0.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    No - (0.00)(नहीं)   - (0.00)                                
                    </label>
                  </div>  
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tq16_toilet_pit_sanitation ? "border-danger" : ""
                      }`}
                      type="radio"
                      name="tq16_toilet_pit_sanitation"
                      {...register("tq16_toilet_pit_sanitation", {
                        required: "Please select one option",
                      })}
                      id="singleShift"
                      value="ans_1.0"
                    />
                    <label className="form-check-label" htmlFor="singleShift">
                    Yes - (1.00)  (हाँ) - (1.00)                                
                    </label>
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
      {/* <FooterWithoutLogin /> */}
    </div>
  );
}