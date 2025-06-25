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

export default function Handwash() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");
  // const [hidePanchayat, sethidePanchayat] = useState(false);
  // const [hideVillage, sethideVillage] = useState(false);

  // const [showUrbanBodyName, setshowUrbanBodyName] = useState(false);
  // const [showWardName, setshowWardName] = useState(false);

  const { token, allSurveyData, saveScores,scores,saveallData } = useAuth();
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
      if (parsedData?.handwash_info) {
         PreFillData(parsedData);
      }
    }
    setShowLoader(false);
  }, [token]);

  const PreFillData = (allSurveyData) => {
    let primaryDatas = (allSurveyData)?.handwash_info;
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
    //   setValue("urban_body_name5", primaryDatas?.urban_body_name5);
    //   setValue("ward_name6", primaryDatas?.ward_name6);
    // } else {
    //   setValue("panchayat5", primaryDatas?.panchayat5);
    //   setValue("village6", primaryDatas?.village6);
    // }
  };
  //const district3Value = watch("district3", "");

  const onSubmit = (hw_data) => {
    setShowLoader(true);
    if (hw_data && Object.keys(hw_data).length > 0) {
       
      console.log(hw_data);
      let sum = 0;

      // Loop through the object and add the value after replacing "ans_"
      for (const key in hw_data) {
          const value = hw_data[key].replace('ans_', ''); // Remove 'ans_' from the value
          sum += parseFloat(value); // Convert to float and add to the sum
      }
      console.log("Max Score: 15, Obtained:"+ sum);

      const mhmSurveyData=  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

      const updatedSurveyData = { ...mhmSurveyData, handwash_info: hw_data };
      saveallData(updatedSurveyData);

      saveScores("HandWashing", { "max": 10, "got": sum });


      showNotificationMsg("success", "Please Wait ...", {
        autoClose: 3000,
      });
      // setTimeout(() => {
      //   nav("/user/water");
      // }, 1500);

      const jsonObject = {
        udise_code: userinfos.udise_code,
        mobile: userinfos.mobile,
        columnname:"handwash_info" ,
        data: hw_data,
        columnname1:"scores" ,
        scores: "HandWashing||15||"+sum
      };
      sessionStorage.setItem("handwash_info",JSON.stringify(hw_data));
        postData("saveSurvey.php",  JSON.stringify(jsonObject));
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
      <AuthMenu pageName="handwash_info" />
      <p className="text-center">
        <span className="d-block text-primary fw-bold">(10 Marks)</span>
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
                <label
                  htmlFor="hq1_handwashing_facility_toilet"
                  className="col-form-label"
                >
                  1. Does the school have facility for handwashing after use of
                  toilet?(क्या विद्यालय में शौचालय के उपयोग के बाद हाथ धोने की सुविधा है?)
                  {errors.hq1_handwashing_facility_toilet && (
                    <span className="text-danger">
                      {errors.hq1_handwashing_facility_toilet.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq1_handwashing_facility_toilet
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0"
                    {...register("hq1_handwashing_facility_toilet", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    No hand washing facility (with water provision) near the
                    toilet units(शौचालय इकाइयों के पास हाथ धोने की कोई सुविधा नहीं है) - (0.00)                                
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq1_handwashing_facility_toilet
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0.50"
                    {...register("hq1_handwashing_facility_toilet", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Wash basin or hand washing point (with water provision)
                    close to the toilet units(शौचालय इकाइयों के पास हाथ धोने का सिंक या प्वाइंट (पानी की व्यवस्था के साथ))- (0.50)                                
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq1_handwashing_facility_toilet
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="1.00"
                    {...register("hq1_handwashing_facility_toilet", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Wash basin either inside or attached to every toilet unit
                    (with water provision- through handpump, bucket, drum etc.)(पानी की व्यवस्था के साथ - हैंडपंप, बाल्टी, ड्रम आदि द्वारा) - (1.00)                                
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq1_handwashing_facility_toilet
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="2.00"
                    {...register("hq1_handwashing_facility_toilet", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Wash basin either inside or attached to every toilet (with
                    running water)(प्रत्येक शौचालय इकाई में हाथ धोने का सिंक (पानी की व्यवस्था के साथ)) - (2.00)                                
                  </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="hq2_soap_for_handwashing_toilet"
                  className="col-form-label"
                >
                  2. Does the school provide soaps for hand washing after use of
                  toilets?(क्या विद्यालय  शौचालय उपयोग के बाद हाथ धोने के लिए साबुन प्रदान करता है?)
                  {errors.hq2_soap_for_handwashing_toilet && (
                    <span className="text-danger">
                      {errors.hq2_soap_for_handwashing_toilet.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq2_soap_for_handwashing_toilet
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0"
                    {...register("hq2_soap_for_handwashing_toilet", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No soaps available(साबुन उपलब्ध नहीं हैं) </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq2_soap_for_handwashing_toilet
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="1.00"
                    {...register("hq2_soap_for_handwashing_toilet", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Soaps are placed under supervision and are available on
                    demand(साबुन निगरानी में रखे जाते हैं और मांग पर उपलब्ध होते हैं) 
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq2_soap_for_handwashing_toilet
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="2.00"
                    {...register("hq2_soap_for_handwashing_toilet", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Soaps are available at all the hand washing points all the
                    time(सभी हाथ धोने के स्थान पर हमेशा साबुन उपलब्ध होते हैं)
                  </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="hq3_handwashing_facility_before_mdm"
                  className="col-form-label"
                >
                  3. Does the school have facility for handwashing before
                  Mid-Day Meal (MDM)/ lunch where a group of children can
                  practice hand washing at the same time?(क्या विद्यालय में मध्याह्न भोजन (MDM) / भोजन से पहले हाथ धोने की सुविधा है, जहां एक समूह एक साथ हाथ धो सकता है?)
                  {errors.hq3_handwashing_facility_before_mdm && (
                    <span className="text-danger">
                      {errors.hq3_handwashing_facility_before_mdm.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq3_handwashing_facility_before_mdm
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0"
                    {...register("hq3_handwashing_facility_before_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    No hand washing facility(कोई हाथ धोने की सुविधा नहीं है) 
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq3_handwashing_facility_before_mdm
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0.50"
                    {...register("hq3_handwashing_facility_before_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Yes, with water from hand pump/bucket close to dining area(हां, चापाकल/बाल्टी से पानी की व्यवस्था के साथ डाइनिंग क्षेत्र के पास)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq3_handwashing_facility_before_mdm
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="1.00"
                    {...register("hq3_handwashing_facility_before_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Yes, with water from taps (हां, नलों से पानी की व्यवस्था के साथ) 
                  </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="hq4_soap_for_handwashing_before_mdm"
                  className="col-form-label"
                >
                  4. Does the school provide soaps for handwashing before
                  Mid-Day Meal (MDM)/ lunch?(क्या विद्यालय मध्याह्न भोजन (MDM) / भोजन से पहले हाथ धोने के लिए साबुन प्रदान करता है?)
                  {errors.hq4_soap_for_handwashing_before_mdm && (
                    <span className="text-danger">
                      {errors.hq4_soap_for_handwashing_before_mdm.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq4_soap_for_handwashing_before_mdm
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0"
                    {...register("hq4_soap_for_handwashing_before_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No soaps available(साबुन उपलब्ध नहीं हैं) </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq4_soap_for_handwashing_before_mdm
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0.75"
                    {...register("hq4_soap_for_handwashing_before_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Soaps are placed under supervision and are available on
                    demand(साबुन निगरानी में रखे जाते हैं और मांग पर उपलब्ध होते हैं)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq4_soap_for_handwashing_before_mdm
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="1.00"
                    {...register("hq4_soap_for_handwashing_before_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Soaps are available at all the handwashing points all the
                    time(सभी हाथ धोने के प्वाइंट्स पर हमेशा साबुन उपलब्ध होते हैं)
                  </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="hq5_children_washing_with_soap_mdm"
                  className="col-form-label"
                >
                  5. Do all children wash their hands with soap before mid-day
                  meal (MDM)/ Lunch?(क्या सभी बच्चे मध्याह्न भोजन (MDM)/ भोजन से पहले साबुन से हाथ धोते हैं?)
                  {errors.hq5_children_washing_with_soap_mdm && (
                    <span className="text-danger">
                      {errors.hq5_children_washing_with_soap_mdm.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq5_children_washing_with_soap_mdm
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0"
                    {...register("hq5_children_washing_with_soap_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    No, all children are not washing their hands with soap(नहीं, सभी बच्चे साबुन से हाथ नहीं धोते) 
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq5_children_washing_with_soap_mdm
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0.50"
                    {...register("hq5_children_washing_with_soap_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Yes, some children wash their hands with soap(हां, कुछ बच्चे साबुन से हाथ धोते हैं)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq5_children_washing_with_soap_mdm
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="2.00"
                    {...register("hq5_children_washing_with_soap_mdm", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">
                    Yes, all children wash their hands with soap(हां, सभी बच्चे साबुन से हाथ धोते हैं)
                  </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="hq6_handwashing_facility_suitable_height"
                  className="col-form-label"
                >
                  6. Is the height of handwashing facilities suitable for
                  children of all age groups in the school?(क्या हाथ धोने की सुविधाओं की ऊंचाई स्कूल के सभी आयु वर्ग के बच्चों के लिए उपयुक्त है?)
                  {errors.hq6_handwashing_facility_suitable_height && (
                    <span className="text-danger">
                      {errors.hq6_handwashing_facility_suitable_height.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq6_handwashing_facility_suitable_height
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0"
                    {...register("hq6_handwashing_facility_suitable_height", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq6_handwashing_facility_suitable_height
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="1.00"
                    {...register("hq6_handwashing_facility_suitable_height", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="hq7_handwashing_facility_accessibility"
                  className="col-form-label"
                >
                  7. Is there any arrangement for easy access to children with
                  disability at handwashing point?(क्या बच्चों के लिए हाथ धोने के स्थान पर आसानी से पहुंचने की व्यवस्था है?)
                  {errors.hq7_handwashing_facility_accessibility && (
                    <span className="text-danger">
                      {errors.hq7_handwashing_facility_accessibility.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq7_handwashing_facility_accessibility
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="0"
                    {...register("hq7_handwashing_facility_accessibility", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.hq7_handwashing_facility_accessibility
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="1.00"
                    {...register("hq7_handwashing_facility_accessibility", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes</label>
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
