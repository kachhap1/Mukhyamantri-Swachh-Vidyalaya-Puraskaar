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

export default function OperationMaintenance() {
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
        if (parsedData?.opr_maintenance) {
          PreFillData(parsedData);
        }
     
    }
    setShowLoader(false);
  }, [token]);


  const PreFillData =(allSurveyData)=>{ 
    let primaryDatas = (allSurveyData)?.opr_maintenance;
       console.log(primaryDatas); 
       primaryDatas =  (typeof primaryDatas === 'string') ? JSON.parse(primaryDatas) : primaryDatas;
    
     
     if(primaryDatas && Object.keys(primaryDatas).length){
      Object.keys(primaryDatas).forEach((key) => {
        setValue(key, primaryDatas[key]); // Set value for the respective form field
      });
    }
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

  const onSubmit = (onmdata) => {
    setShowLoader(true);
    if (onmdata && Object.keys(onmdata).length > 0) {
      
       console.log(onmdata);

       let sum = 0;

       // Loop through the object and add the value after replacing "ans_"
       for (const key in onmdata) {
           const value = onmdata[key].replace('ans_', ''); // Remove 'ans_' from the value
           sum += parseFloat(value); // Convert to float and add to the sum
       }
       console.log("Max Score: 15, Obtained:"+ sum);
       const mhmSurveyData=  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

       const updatedSurveyData = { ...mhmSurveyData, opr_maintenance: onmdata };
       saveallData(updatedSurveyData);


       saveScores("OnM", { "max": 15, "got": sum });

     // saveSchoolPrimaryInfo(updatedData);
      showNotificationMsg("success", "Please Wait ...", {
        autoClose: 3000,
      });
      

      const jsonObject = {
        udise_code: userinfos.udise_code,
        mobile: userinfos.mobile,
        columnname:"opr_maintenance" ,
        data: onmdata,
        columnname1:"scores" ,
        scores: "OnM||15||"+sum
      };
      sessionStorage.setItem("opr_maintenance",onmdata);

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
      <HeaderComponent />
      <AuthMenu pageName="operation_maintenance_info" />
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
    <label htmlFor="omq1_wastewater_disposal_mechanism" className="col-form-label">
      1. Does the school have a proper mechanism for wastewater disposal near all the hand washing unit?(क्या विद्यालय में सभी हाथ धोने की इकाइयों के पास जल निकासी की उचित व्यवस्था है?)
      {errors.omq1_wastewater_disposal_mechanism && (
        <span className="text-danger">
          {errors.omq1_wastewater_disposal_mechanism.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq1_wastewater_disposal_mechanism ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq1_wastewater_disposal_mechanism", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq1_wastewater_disposal_mechanism ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq1_wastewater_disposal_mechanism", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq2_dustbins_in_areas" className="col-form-label">
      2. Does the school provide dustbins in each class room, kitchen area, toilets and at other appropriate locations for collection of waste?(क्या विद्यालय प्रत्येक कक्षा कक्ष, रसोई क्षेत्र, शौचालय और अन्य उपयुक्त स्थानों पर कूड़ेदान प्रदान करता है?)
      {errors.omq2_dustbins_in_areas && (
        <span className="text-danger">
          {errors.omq2_dustbins_in_areas.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq2_dustbins_in_areas ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq2_dustbins_in_areas", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq2_dustbins_in_areas ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq2_dustbins_in_areas", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, in each classroom(हाँ, प्रत्येक कक्षा में)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq2_dustbins_in_areas ? "border-danger" : ""
        }`}
        type="radio"
        value="0.75"
        {...register("omq2_dustbins_in_areas", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, in all classrooms and kitchen(हाँ, सभी कक्षाओं और रसोईघर में)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq2_dustbins_in_areas ? "border-danger" : ""
        }`}
        type="radio"
        value="0.90"
        {...register("omq2_dustbins_in_areas", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, in all classrooms, kitchen, and toilet locations(हाँ, सभी कक्षाओं, रसोईघर और शौचालय स्थानों में)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq2_dustbins_in_areas ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq2_dustbins_in_areas", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, in all classrooms, kitchen, toilet locations, and all other appropriate areas in the school(हाँ, सभी कक्षाओं, रसोईघर, शौचालय स्थानों और स्कूल के सभी अन्य उपयुक्त क्षेत्रों में)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq3_disposal_of_non_biodegradable_waste" className="col-form-label">
      3. How does the school dispose its non-biodegradable waste (dry waste)?(विद्यालय अपना सूखा कूड़ा कैसे नष्ट करता है?)
      {errors.omq3_disposal_of_non_biodegradable_waste && (
        <span className="text-danger">
          {errors.omq3_disposal_of_non_biodegradable_waste.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq3_disposal_of_non_biodegradable_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq3_disposal_of_non_biodegradable_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No specific measure / throw anywhere / dumped at a place aside in campus / nearby / Burnt on school premises(कोई विशेष उपाय नहीं / कहीं भी फेंक दिया जाता है / परिसर में कहीं डाला जाता है / जलाया जाता है) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq3_disposal_of_non_biodegradable_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="0.25"
        {...register("omq3_disposal_of_non_biodegradable_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Buried on school premises(विद्यालय परिसर में दफन किया जाता है) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq3_disposal_of_non_biodegradable_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq3_disposal_of_non_biodegradable_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Collection by municipality/Panchayat(नगरपालिका/पंचायत द्वारा संग्रहण किया जाता है) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq4_compost_biodegradable_waste" className="col-form-label">
    4. How does the school compost its own biodegradable waste (wet waste)?(विद्यालय अपने जैविक अपशिष्ट (गीला कूड़ा) को कैसे खाद बनाता है?)
      {errors.omq4_compost_biodegradable_waste && (
        <span className="text-danger">
          {errors.omq4_compost_biodegradable_waste.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq4_compost_biodegradable_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq4_compost_biodegradable_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No specific measure( कोई विशिष्ट उपाय नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq4_compost_biodegradable_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq4_compost_biodegradable_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, waste taken away for composting by someone(कूड़ा किसी और के द्वारा खाद के लिए लिया जाता है) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq4_compost_biodegradable_waste ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq4_compost_biodegradable_waste", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, on school premises(विद्यालय परिसर में खाद बनाते हैं)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq5_cleanliness_of_premises" className="col-form-label">
      5. Is the school premises clean (free from littering)?(क्या विद्यालय परिसर साफ-सुथरा है (कचरे से मुक्त)?)
      {errors.omq5_cleanliness_of_premises && (
        <span className="text-danger">
          {errors.omq5_cleanliness_of_premises.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq5_cleanliness_of_premises ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq5_cleanliness_of_premises", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq5_cleanliness_of_premises ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq5_cleanliness_of_premises", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq6_cleanliness_free_water_logging" className="col-form-label">
      6. Are the school premises clean and free of water logging?(क्या विद्यालय परिसर साफ और जलभराव से मुक्त है?)
      {errors.omq6_cleanliness_free_water_logging && (
        <span className="text-danger">
          {errors.omq6_cleanliness_free_water_logging.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq6_cleanliness_free_water_logging ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq6_cleanliness_free_water_logging", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)  </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq6_cleanliness_free_water_logging ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq6_cleanliness_free_water_logging", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq7_boundary_wall_and_gates" className="col-form-label">
     7. Does the school have a boundary wall with secured gates, to support the safety and security of the WASH facilities during all times?(क्या विद्यालय में WASH सुविधाओं की सफाई की नियमित निगरानी (जैसे चेकलिस्ट या अवलोकन के माध्यम से) का कोई तंत्र है?)
      {errors.omq7_boundary_wall_and_gates && (
        <span className="text-danger">
          {errors.omq7_boundary_wall_and_gates.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq7_boundary_wall_and_gates ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq7_boundary_wall_and_gates", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)  </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq7_boundary_wall_and_gates ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq7_boundary_wall_and_gates", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq8_monitoring_of_wash_facilities" className="col-form-label">
      8. Does the school have a system for regular monitoring (e.g., through checklists or observation) of the cleaning of WASH facilities?(क्या विद्यालय में WASH सुविधाओं की सफाई की नियमित निगरानी (जैसे चेकलिस्ट या अवलोकन के माध्यम से) का कोई तंत्र है?)
      {errors.omq8_monitoring_of_wash_facilities && (
        <span className="text-danger">
          {errors.omq8_monitoring_of_wash_facilities.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq8_monitoring_of_wash_facilities ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq8_monitoring_of_wash_facilities", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq8_monitoring_of_wash_facilities ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq8_monitoring_of_wash_facilities", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq9_classroom_teaching_area_daily_clean" className="col-form-label">
      9. Are the classrooms and teaching areas cleaned daily?( क्या कक्षा और शिक्षण क्षेत्र रोजाना साफ किए जाते हैं?)
      {errors.omq9_classroom_teaching_area_daily_clean && (
        <span className="text-danger">
          {errors.omq9_classroom_teaching_area_daily_clean.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq9_classroom_teaching_area_daily_clean ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq9_classroom_teaching_area_daily_clean", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq9_classroom_teaching_area_daily_clean ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq9_classroom_teaching_area_daily_clean", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ)</label>
    </div>
  </div>
</div>


<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq10_cleaning_frequency_of_toilets" className="col-form-label">
     10. What is the frequency of cleaning toilets?(शौचालयों की सफाई की आवृत्ति क्या है?)
      {errors.omq10_cleaning_frequency_of_toilets && (
        <span className="text-danger">
          {errors.omq10_cleaning_frequency_of_toilets.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq10_cleaning_frequency_of_toilets ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq10_cleaning_frequency_of_toilets", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No specific schedule(कोई विशिष्ट शेड्यूल नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq10_cleaning_frequency_of_toilets ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq10_cleaning_frequency_of_toilets", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Once a week(सप्ताह में एक बार)  </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq10_cleaning_frequency_of_toilets ? "border-danger" : ""
        }`}
        type="radio"
        value="0.75"
        {...register("omq10_cleaning_frequency_of_toilets", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Twice in a week(सप्ताह में दो बार)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq10_cleaning_frequency_of_toilets ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq10_cleaning_frequency_of_toilets", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Daily(रोजाना) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq11_cleaning_material_for_toilets" className="col-form-label">
     11. Are toilets cleaned with appropriate cleaning material?( क्या शौचालयों की सफाई उपयुक्त सफाई सामग्री से की जाती है?)
      {errors.omq11_cleaning_material_for_toilets && (
        <span className="text-danger">
          {errors.omq11_cleaning_material_for_toilets.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq11_cleaning_material_for_toilets ? "border-danger" : ""
        }`}
        type="radio"
        value="0.25"
        {...register("omq11_cleaning_material_for_toilets", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Cleaned only with water(केवल पानी से साफ किया जाता है)  </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq11_cleaning_material_for_toilets ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq11_cleaning_material_for_toilets", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Cleaned at least once a month with soaping agent and disinfectant(कम से कम महीने में एक बार साबुन और डीसइन्फेक्टेंट के साथ साफ किया जाता है) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq11_cleaning_material_for_toilets ? "border-danger" : ""
        }`}
        type="radio"
        value="0.75"
        {...register("omq11_cleaning_material_for_toilets", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Cleaned at least twice a week with soaping agent and disinfectant(कम से कम सप्ताह में दो बार साबुन और डीसइन्फेक्टेंट के साथ साफ किया जाता है)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq11_cleaning_material_for_toilets ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq11_cleaning_material_for_toilets", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Cleaned daily with soaping agent and disinfectant(रोजाना साबुन और डीसइन्फेक्टेंट के साथ साफ किया जाता है)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq12_supervision_of_cleaning" className="col-form-label">
      12. Who supervises the cleaning and maintenance of the toilets in the school?(शौचालयों की सफाई और रखरखाव की निगरानी कौन करता है?)
      {errors.omq12_supervision_of_cleaning && (
        <span className="text-danger">
          {errors.omq12_supervision_of_cleaning.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq12_supervision_of_cleaning ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq12_supervision_of_cleaning", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No one in particular(कोई विशेष व्यक्ति नहीं)  </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq12_supervision_of_cleaning ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq12_supervision_of_cleaning", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Team of teachers, staff(शिक्षक और स्टाफ की टीम)   </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq12_supervision_of_cleaning ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq12_supervision_of_cleaning", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Team of teachers, staff, and child cabinet members(शिक्षक, स्टाफ और बाल संसद के सदस्य)  </label>
    </div>
  </div>
</div>
<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq13_repair_maintenance_of_wash_facilities" className="col-form-label">
     13.Does the school take care of the upkeeping, repair, and maintenance of fittings and fixtures of WASH facilities such as taps, flushing cistern, drainage pipes, overhead tank, wash basin, etc. on a regular basis?(क्या विद्यालय WASH सुविधाओं के फिटिंग और फिक्स्चर (जैसे नल, फ्लशिंग सिस्टर्न, नालियों की पाइप, ओवरहेड टैंक, वॉश बेसिन आदि) की नियमित देखभाल, मरम्मत और रखरखाव करता है?)
      {errors.omq13_repair_maintenance_of_wash_facilities && (
        <span className="text-danger">
          {errors.omq13_repair_maintenance_of_wash_facilities.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq13_repair_maintenance_of_wash_facilities ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq13_repair_maintenance_of_wash_facilities", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No, fittings and fixtures are not in working condition(नहीं, फिटिंग और फिक्स्चर काम करने की स्थिति में नहीं हैं) </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq13_repair_maintenance_of_wash_facilities ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq13_repair_maintenance_of_wash_facilities", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, fittings and fixtures are in working condition(हां, फिटिंग और फिक्स्चर काम करने की स्थिति में हैं)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq14_cleaning_material_access" className="col-form-label">
      14. Does the school have access to adequate cleaning materials like disinfectants (e.g., hypochlorite solutions), toilet cleaning liquids, soap, PPE, etc.?(क्या विद्यालय के पास सफाई के पर्याप्त सामग्री (जैसे हाइपोक्लोराइट समाधान, टॉयलेट क्लीनिंग लिक्विड, साबुन, पीपीई आदि) की पहुँच है?)
      {errors.omq14_cleaning_material_access && (
        <span className="text-danger">
          {errors.omq14_cleaning_material_access.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq14_cleaning_material_access ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq14_cleaning_material_access", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)   </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq14_cleaning_material_access ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq14_cleaning_material_access", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq15_cleaning_equipment_access" className="col-form-label">
     15. Does the school have access to adequate cleaning equipment (e.g., broom, shovels, mop, bucket, etc.)?(क्या विद्यालय के पास सफाई के पर्याप्त उपकरण (झाड़ू, फावड़ा, पोछा, बाल्टी आदि) की पहुँच है?)
      {errors.omq15_cleaning_equipment_access && (
        <span className="text-danger">
          {errors.omq15_cleaning_equipment_access.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq15_cleaning_equipment_access ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq15_cleaning_equipment_access", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)  </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq15_cleaning_equipment_access ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq15_cleaning_equipment_access", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq16_linkage_with_service_providers" className="col-form-label">
      16. Does the school have an effective linkage with local service providers for material, plumbing, and technical support for timely repair of the WASH facilities?(क्या विद्यालय के पास WASH सुविधाओं की समय पर मरम्मत के लिए सामग्री, प्लंबिंग, और तकनीकी सहायता के लिए स्थानीय सेवा प्रदाताओं के साथ प्रभावी लिंक है?)
      {errors.omq16_linkage_with_service_providers && (
        <span className="text-danger">
          {errors.omq16_linkage_with_service_providers.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq16_linkage_with_service_providers ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq16_linkage_with_service_providers", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No (नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq16_linkage_with_service_providers ? "border-danger" : ""
        }`}
        type="radio"
        value="0.25"
        {...register("omq16_linkage_with_service_providers", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Not sure(निश्चित नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq16_linkage_with_service_providers ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq16_linkage_with_service_providers", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq17_sanitation_worker_in_school" className="col-form-label">
     17. Is there an arrangement for any part/full-time cleaning/sanitation worker in the school?(क्या विद्यालय में किसी भी प्रकार का पूर्णकालिक/आंशिककालिक सफाई/स्वच्छता कार्यकर्ता उपलब्ध है?)
      {errors.omq17_sanitation_worker_in_school && (
        <span className="text-danger">
          {errors.omq17_sanitation_worker_in_school.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq17_sanitation_worker_in_school ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq17_sanitation_worker_in_school", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)  </label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq17_sanitation_worker_in_school ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq17_sanitation_worker_in_school", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq18_sanitation_worker_trained" className="col-form-label">
    18. If yes, are the sanitation workers trained?(अगर हाँ, तो क्या स्वच्छता कार्यकर्ता प्रशिक्षित हैं?)
      {errors.omq18_sanitation_worker_trained && (
        <span className="text-danger">
          {errors.omq18_sanitation_worker_trained.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq18_sanitation_worker_trained ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq18_sanitation_worker_trained", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq18_sanitation_worker_trained ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq18_sanitation_worker_trained", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq19_gram_panchayat_involvement" className="col-form-label">
     19. Do the Gram Panchayats (GPs)/Urban Local Bodies (ULBs) take an active part in reviewing and addressing school WASH and O&M issues?(क्या ग्राम पंचायतें (GPs)/नगरपालिका (ULBs) विद्यालय के WASH और O&M मुद्दों की समीक्षा और समाधान में सक्रिय रूप से भाग लेती हैं?)
      {errors.omq19_gram_panchayat_involvement && (
        <span className="text-danger">
          {errors.omq19_gram_panchayat_involvement.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq19_gram_panchayat_involvement ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq19_gram_panchayat_involvement", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq19_gram_panchayat_involvement ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq19_gram_panchayat_involvement", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes(हाँ) </label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq20_water_leakage_monitoring" className="col-form-label">
     20. Does the school have a mechanism for regular monitoring and instant repair leakage and wastage of water?(क्या विद्यालय में पानी की रिसाव और बर्बादी की निगरानी और तुरंत मरम्मत करने के लिए कोई तंत्र है?)
      {errors.omq20_water_leakage_monitoring && (
        <span className="text-danger">
          {errors.omq20_water_leakage_monitoring.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq20_water_leakage_monitoring ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq20_water_leakage_monitoring", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq20_water_leakage_monitoring ? "border-danger" : ""
        }`}
        type="radio"
        value="0.25"
        {...register("omq20_water_leakage_monitoring", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, monitoring system(हाँ, निगरानी प्रणाली है)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq20_water_leakage_monitoring ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq20_water_leakage_monitoring", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Both monitoring and instant repair mechanism(हाँ, निगरानी और तत्काल मरम्मत तंत्र दोनों हैं)</label>
    </div>
  </div>
</div>

<div className="row mb-2">
  <div className="col-md-4 offset-md-2">
    <label htmlFor="omq21_waste_collection_in_classrooms" className="col-form-label">
     21. Does the school provide dustbins in each classroom, kitchen area, toilet, and other appropriate locations for the collection of waste?(क्या विद्यालय प्रत्येक कक्षा, रसोई क्षेत्र, टॉयलेट, और अन्य उचित स्थानों पर कचरे के संग्रह के लिए डस्टबिन प्रदान करता है?)
      {errors.omq21_waste_collection_in_classrooms && (
        <span className="text-danger">
          {errors.omq21_waste_collection_in_classrooms.message}
        </span>
      )}
    </label>
  </div>
  <div className="col-md-4">
    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq21_waste_collection_in_classrooms ? "border-danger" : ""
        }`}
        type="radio"
        value="0"
        {...register("omq21_waste_collection_in_classrooms", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">No(नहीं)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq21_waste_collection_in_classrooms ? "border-danger" : ""
        }`}
        type="radio"
        value="0.50"
        {...register("omq21_waste_collection_in_classrooms", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, in each classroom(हाँ, प्रत्येक कक्षा में)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq21_waste_collection_in_classrooms ? "border-danger" : ""
        }`}
        type="radio"
        value="0.75"
        {...register("omq21_waste_collection_in_classrooms", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, in all classroom and kitchen(हाँ, सभी कक्षाओं और रसोई में)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq21_waste_collection_in_classrooms ? "border-danger" : ""
        }`}
        type="radio"
        value="0.90"
        {...register("omq21_waste_collection_in_classrooms", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, in all classroom, kitchen, and Toilet locations(हाँ, सभी कक्षाओं, रसोई और टॉयलेट क्षेत्रों में)</label>
    </div>

    <div className="form-check">
      <input
        className={`form-check-input ${
          errors.omq21_waste_collection_in_classrooms ? "border-danger" : ""
        }`}
        type="radio"
        value="1.00"
        {...register("omq21_waste_collection_in_classrooms", {
          required: "Please select one option",
        })}
      />
      <label className="form-check-label">Yes, in all classroom, kitchen, Toilet locations, and all other appropriate areas in the school(हाँ, सभी कक्षाओं, रसोई, टॉयलेट और विद्यालय के अन्य सभी उचित क्षेत्रों में) </label>
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
