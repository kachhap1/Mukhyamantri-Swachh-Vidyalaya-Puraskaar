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

export default function DisasterManagement() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");

  const { token, allSurveyData, saveScores, scores, saveallData } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch,
    trigger,
  } = useForm();

  const existDisasterManagementCommittee = watch(
    "disaster_management_committee"
  );
  const mappedClimateHazardNearSchool = watch("climate_hazards_mapping");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login"; // You can also use <Navigate to="/login" />
    } else {
      setuserinfos(parseJwtData(token));
      const parsedData =
        typeof allSurveyData === "string"
          ? JSON.parse(allSurveyData)
          : allSurveyData;
      if (parsedData) {
        if (parsedData?.disaster) {
          PreFillData(parsedData);
        }
      }
    }
    setShowLoader(false);
  }, [token]);

  const PreFillData = (allSurveyData) => {
    let primaryDatas = allSurveyData?.disaster;
    console.log(primaryDatas);
    primaryDatas =
      typeof primaryDatas === "string"
        ? JSON.parse(primaryDatas)
        : primaryDatas;
    if (primaryDatas && Object.keys(primaryDatas).length) {
      Object.keys(primaryDatas).forEach((key) => {
        setValue(key, primaryDatas[key]); // Set value for the respective form field
      });
    }
  };
  //const district3Value = watch("district3", "");

  const onSubmit = (disaster_data) => {
    setShowLoader(true);
    if (disaster_data && Object.keys(disaster_data).length > 0) {
      const mhmSurveyData =
        typeof allSurveyData === "string"
          ? JSON.parse(allSurveyData)
          : allSurveyData;

      const updatedSurveyData = { ...mhmSurveyData, disaster: disaster_data };
      saveallData(updatedSurveyData);

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
        columnname: "disaster",
        data: disaster_data,
      };

      if (sessionStorage.hasOwnProperty("SVSB_All_Data")) {
        let sessionObj = JSON.parse(sessionStorage?.SVSB_All_Data);
        sessionObj.disaster = JSON.stringify(disaster_data);
        sessionStorage.setItem("SVSB_All_Data", JSON.stringify(sessionObj));
      }
      postData("saveSurvey.php", JSON.stringify(jsonObject));
    } else {
      console.log("Missing Inputs");
      showNotificationMsg("error", "Missing Inputs !!", { autoClose: 3000 });
    }
    setShowLoader(false);
  };

  const postData = async (endpoint, jsonData) => {
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
          sessionStorage.setItem("SVSB_primary_saved", "yes");
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
      <AuthMenu pageName="disaster_info" />
      <p className="text-center"></p>
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
                <label
                  htmlFor="disaster_management_committee"
                  className="col-form-label"
                >
                  3.1. Does the school have a disaster management/safe schools
                  or equivalent committee? (क्या विद्यालय के पास आपदा प्रबंधन/सुरक्षित विद्यालय या समकक्ष समिति है?)
                  {errors.disaster_management_committee && (
                    <span className="text-danger">
                      {errors.disaster_management_committee.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.disaster_management_committee
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("disaster_management_committee", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.disaster_management_committee
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("disaster_management_committee", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>

{existDisasterManagementCommittee ==="Yes" && ( 

                <div className="mt-2">
                  <label className="form-label">Total Members (कुल सदस्य)</label>
                  <input
                    className="form-control mb-1"
                    type="number"
                    placeholder="Total Members"
                    {...register("total_members", { required: true })}
                  />
                  <label className="form-label">Male (पुरुष)</label>
                  <input
                    className="form-control mb-1"
                    type="number"
                    placeholder="Male"
                    {...register("male_members", { required: true })}
                  />
                  <label className="form-label">Female (महिला)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Female"
                    {...register("female_members", { required: true })}
                  />
                </div>)}
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="sdmp_ssp" className="col-form-label">
                  3.2. Has the school developed a School Disaster Management
                  Plan (SDMP)/ School Safety Plan (SSP)? (क्या विद्यालय ने विद्यालय आपदा प्रबंधन योजना (SDMP)/ विद्यालय सुरक्षा योजना (SSP) विकसित की है?)
                  {errors.sdmp_ssp && (
                    <span className="text-danger">
                      {errors.sdmp_ssp.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.sdmp_ssp ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("sdmp_ssp", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.sdmp_ssp ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("sdmp_ssp", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="climate_hazards_mapping"
                  className="col-form-label"
                >
                  3.3. If the school has developed SDMP/SSP, has it mapped
                  climate and natural hazards around the school, including the
                  intensity (high, medium, low)? (यदि विद्यालय ने SDMP/SSP विकसित किया है, क्या उसने विद्यालय के आसपास जलवायु और प्राकृतिक खतरों का मानचित्रण किया है, जिसमें तीव्रता (उच्च, मध्यम, कम) शामिल है?)
                  {errors.climate_hazards_mapping && (
                    <span className="text-danger">
                      {errors.climate_hazards_mapping.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.climate_hazards_mapping ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("climate_hazards_mapping", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.climate_hazards_mapping ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("climate_hazards_mapping", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>

        {mappedClimateHazardNearSchool ==="Yes" && (

        
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="children_involvement_mapping"
                  className="col-form-label"
                >
                  3.4. If yes in 3.3, were children actively involved in all
                  kinds of risk and hazard mapping? (यदि हाँ, तो क्या बच्चों को सभी प्रकार के जोखिम और खतरों के मानचित्रण में सक्रिय रूप से शामिल किया गया था?)
                  {errors.children_involvement_mapping && (
                    <span className="text-danger">
                      {errors.children_involvement_mapping.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.children_involvement_mapping ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("children_involvement_mapping", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.children_involvement_mapping ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("children_involvement_mapping", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>

)}
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="wash_vulnerability_mapping"
                  className="col-form-label"
                >
                  3.5. Has the school done any WASH services vulnerability
                  mapping related to climate change/natural hazards (as
                  applicable)? (क्या विद्यालय ने जलवायु परिवर्तन/प्राकृतिक आपदाओं से संबंधित WASH सेवाओं की संवेदनशीलता का मानचित्रण किया है?)
                  {errors.wash_vulnerability_mapping && (
                    <span className="text-danger">
                      {errors.wash_vulnerability_mapping.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.wash_vulnerability_mapping ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("wash_vulnerability_mapping", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.wash_vulnerability_mapping ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("wash_vulnerability_mapping", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="exit_routes_identified"
                  className="col-form-label"
                >
                  3.6. Has the school clearly identified exit routes marked for
                  evacuation during floods, earthquake, or other disasters? (क्या आपके विद्यालय ने बाढ़, भूकंप, या अन्य आपदाओं के दौरान निकासी के लिए स्पष्ट रूप से बाहर निकलने के मार्गों की पहचान की है?)
                  {errors.exit_routes_identified && (
                    <span className="text-danger">
                      {errors.exit_routes_identified.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.exit_routes_identified ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("exit_routes_identified", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.exit_routes_identified ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("exit_routes_identified", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="climate_sensitive_wash"
                  className="col-form-label"
                >
                  3.7. Does the school have climate-sensitive WASH facilities
                  (i.e., all WASH services are designed to cope with potential
                  climate events/hazards to remain functional, both during
                  routine operations and in extreme weather events)? (क्या विद्यालय में जलवायु-संवेदनशील WASH सुविधाएँ हैं (यानी सभी WASH सेवाएं डिज़ाइन की गई हैं ताकि वे संभावित जलवायु घटनाओं/आपदाओं के दौरान क्रियाशील रहें, दोनों सामान्य संचालन और चरम मौसम घटनाओं के दौरान)?)
                  {errors.climate_sensitive_wash && (
                    <span className="text-danger">
                      {errors.climate_sensitive_wash.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.climate_sensitive_wash ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("climate_sensitive_wash", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.climate_sensitive_wash ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("climate_sensitive_wash", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.climate_sensitive_wash ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Partially"
                    {...register("climate_sensitive_wash", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Partially (आंशिक रूप से)</label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="disaster_kit_functioning"
                  className="col-form-label"
                >
                  3.8. Does the school have a fully functioning Disaster Kit
                  (Fire Emergency/Chemical Spillage)? ( क्या विद्यालय के पास पूरी तरह क्रियाशील आपदा किट (आग आपातकाल/रासायनिक रिसाव) है?)
                  {errors.disaster_kit_functioning && (
                    <span className="text-danger">
                      {errors.disaster_kit_functioning.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.disaster_kit_functioning ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("disaster_kit_functioning", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.disaster_kit_functioning ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("disaster_kit_functioning", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="infrastructure_safety_audit"
                  className="col-form-label"
                >
                  3.9. Has the school done any Infrastructure Safety Audit last
                  year?  (क्या विद्यालय ने पिछले वर्ष में किसी बुनियादी ढांचा सुरक्षा ऑडिट (Infrastructure Safety Audit) किया है?)
                  {errors.infrastructure_safety_audit && (
                    <span className="text-danger">
                      {errors.infrastructure_safety_audit.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.infrastructure_safety_audit ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("infrastructure_safety_audit", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.infrastructure_safety_audit ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("infrastructure_safety_audit", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="safety_audit_mapping"
                  className="col-form-label"
                >
                  3.10. Has the school done any safety audit services
                  vulnerability mapping related to climate change/natural
                  hazards (as applicable)? (क्या विद्यालय ने जलवायु परिवर्तन/प्राकृतिक आपदाओं से संबंधित सुरक्षा ऑडिट सेवाओं का संवेदनशीलता मानचित्रण (WASH सहित) किया है?)
                  {errors.safety_audit_mapping && (
                    <span className="text-danger">
                      {errors.safety_audit_mapping.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.safety_audit_mapping ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("safety_audit_mapping", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.safety_audit_mapping ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("safety_audit_mapping", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.safety_audit_mapping ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Not sure"
                    {...register("safety_audit_mapping", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Not sure  (सुनिश्चित नहीं) </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="teachers_training_safety"
                  className="col-form-label"
                >
                  3.11. Did teachers receive regular training in school safety
                  and disaster preparedness?( क्या शिक्षकों को विद्यालय सुरक्षा और आपदा तैयारी में नियमित प्रशिक्षण प्राप्त हुआ है?)
                  {errors.teachers_training_safety && (
                    <span className="text-danger">
                      {errors.teachers_training_safety.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.teachers_training_safety ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("teachers_training_safety", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.teachers_training_safety ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("teachers_training_safety", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
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
