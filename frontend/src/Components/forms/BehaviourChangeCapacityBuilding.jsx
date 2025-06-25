import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
// import HeaderComponent from "../component/HeaderComponent";
// import FooterWithoutLogin from "../component/FooterWithoutLogin";
// import aboutBanner from "../images/aboutwash.png";
import AuthMenu from "../AuthMenu";
import Loader from "../Loader";
import { apiJSONPost, parseJwtData } from "../../api/utility";
import { useForm, Controller } from "react-hook-form";
import { showNotificationMsg } from "../../api/common";
import { useNavigate } from "react-router-dom";

export default function BehaviourChangeCapacityBuilding() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");
  // const [hidePanchayat, sethidePanchayat] = useState(false);
  // const [hideVillage, sethideVillage] = useState(false);

  // const [showUrbanBodyName, setshowUrbanBodyName] = useState(false);
  // const [showWardName, setshowWardName] = useState(false);

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
  useEffect(() => {
    if (!token) {
      window.location.href = "/login"; // You can also use <Navigate to="/login" />
    } else {
      setuserinfos(parseJwtData(token));
      const parsedData = (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
      if (parsedData) {
        if (parsedData?.behaviour_capacity) {
          PreFillData(parsedData);
        }

      }
    }
    setShowLoader(false);
  }, [token]);


  const PreFillData = (allSurveyData) => {
    let primaryDatas = (allSurveyData)?.behaviour_capacity;
    console.log(primaryDatas);
    primaryDatas = (typeof primaryDatas === 'string') ? JSON.parse(primaryDatas) : primaryDatas;
    if (primaryDatas && Object.keys(primaryDatas).length) {
      Object.keys(primaryDatas).forEach((key) => {
        setValue(key, primaryDatas[key]); // Set value for the respective form field
      });
    }

  }
  //const district3Value = watch("district3", "");

  const onSubmit = (bcc_data) => {
    setShowLoader(true);
    if (bcc_data && Object.keys(bcc_data).length > 0) {

      //console.log(updatedData);
      let sum = 0;

      // Loop through the object and add the value after replacing "ans_"
      for (const key in bcc_data) {
        const value = bcc_data[key].replace('ans_', ''); // Remove 'ans_' from the value
        sum += parseFloat(value); // Convert to float and add to the sum
      }
      console.log("Max Score: 15, Obtained:" + sum);
      const mhmSurveyData = (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

      const updatedSurveyData = { ...mhmSurveyData, behaviour_capacity: bcc_data };
      saveallData(updatedSurveyData);

      saveScores("BehaviourCapacityBuidling", { "max": 10, "got": sum });

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
        columnname: "behaviour_capacity",
        data: bcc_data,
        columnname1: "scores",
        scores: "BehaviourCapacityBuidling||10||" + sum
      };

      // if(sessionStorage.hasOwnProperty("SVSB_All_Data")){
      //   let sessionObj  = JSON.parse(sessionStorage?.SVSB_All_Data);
      //   sessionObj.behaviour_capacity = JSON.stringify(bcc_data);
      //   sessionStorage.setItem('SVSB_All_Data', JSON.stringify(sessionObj));
      // }




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
      {/* <HeaderComponent /> */}
      <AuthMenu pageName="behaviour_capacity_building_info" />
      <p className="text-center">
        <span className="d-block text-primary fw-bold">(16 Marks)</span>
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
                <label htmlFor="display_wash_messages" className="col-form-label">
                  1. Does the school display messages on WASH components?(क्या विद्यालय WASH घटकों पर संदेश प्रदर्शित करता है?)
                  {errors.display_wash_messages && (
                    <span className="text-danger">
                      {errors.display_wash_messages.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.display_wash_messages ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("display_wash_messages", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.display_wash_messages ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.50"
                    {...register("display_wash_messages", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="student_champions_oriented" className="col-form-label">
                  2. Are there student champions on WASH identified and oriented? (क्या विद्यालय में WASH पर छात्र चैंपियन नियुक्त और प्रशिक्षित किए गए हैं?)
                  {errors.student_champions_oriented && (
                    <span className="text-danger">
                      {errors.student_champions_oriented.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.student_champions_oriented ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("student_champions_oriented", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.student_champions_oriented ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.50"
                    {...register("student_champions_oriented", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="teachers_trained_in_sanitation" className="col-form-label">
                  3. Does the school have at least 2 teachers trained in sanitation and hygiene education? (क्या विद्यालय में कम से कम 2 शिक्षक स्वच्छता और हाइजीन शिक्षा में प्रशिक्षित हैं?)
                  {errors.teachers_trained_in_sanitation && (
                    <span className="text-danger">
                      {errors.teachers_trained_in_sanitation.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.teachers_trained_in_sanitation ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("teachers_trained_in_sanitation", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.teachers_trained_in_sanitation ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("teachers_trained_in_sanitation", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="role_of_child_cabinet" className="col-form-label">
                  4. Role of Child cabinet (Bal-Sansad)/ student-led body, group, or club that takes an active role in promoting sanitation and hygiene practices? (क्या बाल संसद /छात्र-नेतृत्व वाले समूह, क्लब या समिति, स्वच्छता और हाइजीन प्रथाओं को बढ़ावा देने में सक्रिय भूमिका निभाते हैं?)
                  {errors.role_of_child_cabinet && (
                    <span className="text-danger">
                      {errors.role_of_child_cabinet.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.role_of_child_cabinet ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("role_of_child_cabinet", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.role_of_child_cabinet ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("role_of_child_cabinet", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ) </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="supervision_of_handwashing" className="col-form-label">
                  5. Who supervises the practice of daily handwashing with soap by students and by cooks before Mid-Day Meal (MDM) / lunch? (विद्यालय में छात्रों द्वारा और खाना बनाने वालों द्वारा मध्याह्न भोजन (MDM)/लंच से पहले साबुन से हाथ धोने की प्रक्रिया की निगरानी कौन करता है?)
                  {errors.supervision_of_handwashing && (
                    <span className="text-danger">
                      {errors.supervision_of_handwashing.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.supervision_of_handwashing ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("supervision_of_handwashing", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No one in particular (कोई नहीं) </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.supervision_of_handwashing ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.50"
                    {...register("supervision_of_handwashing", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Teacher/ staff member (शिक्षक/कर्मचारी सदस्य)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.supervision_of_handwashing ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.75"
                    {...register("supervision_of_handwashing", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Dedicated team of teachers/ staff members (शिक्षक/कर्मचारी सदस्यों की समर्पित टीम)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.supervision_of_handwashing ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("supervision_of_handwashing", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Dedicated team of teachers/staff members and child cabinet members (शिक्षक/कर्मचारी सदस्य और बाल संसद के सदस्य)
                  </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="hygiene_education_in_assembly" className="col-form-label">
                  6. Does the school take up safe hygiene and sanitation education including awareness on hand-washing during morning assembly and in school clubs? ( क्या विद्यालय में सुबह की सभा और विद्यालय क्लबों में सुरक्षित स्वच्छता और हाइजीन शिक्षा के साथ हाथ धोने के बारे में जागरूकता कार्यक्रम होते हैं?)
                  {errors.hygiene_education_in_assembly && (
                    <span className="text-danger">
                      {errors.hygiene_education_in_assembly.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.hygiene_education_in_assembly ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("hygiene_education_in_assembly", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं) </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.hygiene_education_in_assembly ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("hygiene_education_in_assembly", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ) </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="msvp_displayed" className="col-form-label">
                  7. Whether the MSVP indicator is displayed in school? (क्या विद्यालय में MSVP संकेतक प्रदर्शित किया गया है?)
                  {errors.msvp_displayed && (
                    <span className="text-danger">{errors.msvp_displayed.message}</span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.msvp_displayed ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("msvp_displayed", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.msvp_displayed ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("msvp_displayed", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="special_days_observed" className="col-form-label">
                  8. Does the school observe special days/fortnights actively- such as World Env. Day, Earth Day, World Water Day, World Toilet Day/GHD/ World Hand Hygiene/ Swachhata Pakhwada? (क्या विद्यालय विशेष दिनों/अवधियों (जैसे विश्व पर्यावरण दिवस, पृथ्वी दिवस, विश्व जल दिवस, विश्व टॉयलेट दिवस, GHD, विश्व हाथ धोने का दिन, स्वच्छता पखवाड़ा) को सक्रिय रूप से मनाता है?)
                  {errors.special_days_observed && (
                    <span className="text-danger">{errors.special_days_observed.message}</span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.special_days_observed ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("special_days_observed", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.special_days_observed ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.50"
                    {...register("special_days_observed", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Sometimes (कभी-कभी)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.special_days_observed ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("special_days_observed", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes, always (हाँ) </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="climate_resilient_posters" className="col-form-label">
                  9. Does the school display and use climate resilient water, sanitation, and hygiene-related posters and materials for promoting environmental and hygiene education?? (क्या विद्यालय जलवायु प्रतिरोधी जल, स्वच्छता और हाइजीन संबंधित पोस्टर और सामग्री प्रदर्शित और उपयोग करता है, जो पर्यावरण और स्वच्छता शिक्षा को बढ़ावा देती हैं?)
                  {errors.climate_resilient_posters && (
                    <span className="text-danger">
                      {errors.climate_resilient_posters.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.climate_resilient_posters ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("climate_resilient_posters", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.climate_resilient_posters ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("climate_resilient_posters", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="handwashing_recording_system" className="col-form-label">
                  10. Does the school have developed some kind of recording system of daily handwashing with soap before the mid-day meal? (क्या विद्यालय ने मध्याह्न भोजन से पहले साबुन से हाथ धोने की प्रक्रिया का रिकॉर्ड रखने के लिए कोई प्रणाली विकसित की है?)
                  {errors.handwashing_recording_system && (
                    <span className="text-danger">
                      {errors.handwashing_recording_system.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.handwashing_recording_system ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("handwashing_recording_system", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.handwashing_recording_system ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("handwashing_recording_system", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="cultural_programs_competitions" className="col-form-label">
                  11. Does the school conduct cultural programs and competitions (essay, painting, skit, debate) on climate resilient water, sanitation, and hygiene services? (क्या विद्यालय जलवायु प्रतिरोधी जल, स्वच्छता और हाइजीन सेवाओं पर सांस्कृतिक कार्यक्रम और प्रतियोगिताएं (निबंध, चित्रकला, नाटक, बहस) आयोजित करता है?)
                  {errors.cultural_programs_competitions && (
                    <span className="text-danger">
                      {errors.cultural_programs_competitions.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.cultural_programs_competitions ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("cultural_programs_competitions", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No / rarely (नहीं/कभी-कभी)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.cultural_programs_competitions ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.50"
                    {...register("cultural_programs_competitions", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes, sometimes (कभी-कभी)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.cultural_programs_competitions ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("cultural_programs_competitions", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes, regularly (नियमित रूप से)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="school_safety_pledge" className="col-form-label">
                  12. Whether the school displays the School Safety Pledge? (क्या विद्यालय सुरक्षा प्रतिज्ञा प्रदर्शित करता है?)
                  {errors.school_safety_pledge && (
                    <span className="text-danger">
                      {errors.school_safety_pledge.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.school_safety_pledge ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("school_safety_pledge", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.school_safety_pledge ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("school_safety_pledge", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="students_wash_before_mdm" className="col-form-label">
                  13. Do all children wash their hands with soap before mid-day meal (MDM)/ Lunch? (क्या सभी बच्चे मध्याह्न भोजन (MDM)/लंच से पहले साबुन से हाथ धोते हैं?)
                  {errors.students_wash_before_mdm && (
                    <span className="text-danger">
                      {errors.students_wash_before_mdm.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.students_wash_before_mdm ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("students_wash_before_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No, not all children are washing their hands with soap (सभी बच्चे साबुन से हाथ नहीं धोते)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.students_wash_before_mdm ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_1.00"
                    {...register("students_wash_before_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes, all children wash their hands with soap (सभी बच्चे साबुन से हाथ धोते हैं)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="smc_orientation_climate_resilient" className="col-form-label">
                  14. Have the SMCs/ SDMCs members been oriented/trained on climate resilient WinS? (क्या SMCs/SDMCs के सदस्य जलवायु प्रतिरोधी WASH पर कोई प्रशिक्षण प्राप्त किये हैं?)
                  {errors.smc_orientation_climate_resilient && (
                    <span className="text-danger">
                      {errors.smc_orientation_climate_resilient.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.smc_orientation_climate_resilient ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("smc_orientation_climate_resilient", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.smc_orientation_climate_resilient ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_2.00"
                    {...register("smc_orientation_climate_resilient", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="smc_involvement_in_wash" className="col-form-label">
                  15. Does the School Management Committee take an active part in reviewing and addressing school WASH and operation and maintenance (functionality of the water, toilet, handwashing & general cleanliness) related issues in their monthly meetings? (क्या विद्यालय प्रबंधन समिति (SMC) अपने मासिक बैठकों में WASH और संचालन और रखरखाव (पानी, टॉयलेट, हाथ धोने और सामान्य स्वच्छता कार्यक्षमता) संबंधित मुद्दों की समीक्षा और समाधान में सक्रिय रूप से भाग लेती है?)
                  {errors.smc_involvement_in_wash && (
                    <span className="text-danger">
                      {errors.smc_involvement_in_wash.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.smc_involvement_in_wash ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_0.00"
                    {...register("smc_involvement_in_wash", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं) </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.smc_involvement_in_wash ? "border-danger" : ""
                      }`}
                    type="radio"
                    value="ans_2.00"
                    {...register("smc_involvement_in_wash", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes, regularly (हाँ) </label>
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