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

export default function MDM() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");

  const { token, allSurveyData, saveallData } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch,
    trigger,
  } = useForm();

  const PreFillData = (allSurveyData) => {
    let primaryDatas = allSurveyData?.mdm;
    primaryDatas =
      typeof primaryDatas === "string"
        ? JSON.parse(primaryDatas)
        : primaryDatas;
    console.log(primaryDatas);
    if (primaryDatas && Object.keys(primaryDatas).length) {
      Object.keys(primaryDatas).forEach((key) => {
        setValue(key, primaryDatas[key]); // Set value for the respective form field
      });
    }
  };

  //const district3Value = watch("district3", "");

  const onSubmit = (mdm_data) => {
    setShowLoader(true);
    if (mdm_data && Object.keys(mdm_data).length > 0) {
      const mhmSurveyData =
        typeof allSurveyData === "string"
          ? JSON.parse(allSurveyData)
          : allSurveyData;

      const updatedSurveyData = { ...mhmSurveyData, mdm: mdm_data };
      saveallData(updatedSurveyData);

      //console.log(updatedData);
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
        columnname: "mdm",
        data: mdm_data,
      };
      if (sessionStorage.hasOwnProperty("SVSB_All_Data")) {
        let sessionObj = JSON.parse(sessionStorage?.SVSB_All_Data);
        sessionObj.mdm = JSON.stringify(mdm_data);
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
        if (parsedData?.mdm) {
          PreFillData(parsedData);
        }
      }
    }
    setShowLoader(false);
  }, [token, allSurveyData]);

  return (
    <div className="wrapper">
      {showLoader && <Loader />}
      <HeaderComponent />
      <AuthMenu pageName="mdm_info" />
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
                  htmlFor="students_avail_midday_meals"
                  className="col-form-label"
                >
                  3.3.1 What percentage of students in the school avail midday
                  meals during lunchtime? (कितने प्रतिशत छात्र मध्याह्न भोजन के दौरान भोजन करते हैं?)
                  {errors.students_avail_midday_meals && (
                    <span className="text-danger">
                      {errors.students_avail_midday_meals.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.students_avail_midday_meals ? "border-danger" : ""
                  }`}
                  {...register("students_avail_midday_meals", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="100%">100%</option>
                  <option value="99-91%">99-91%</option>
                  <option value="90-80%">90-80%</option>
                  <option value="80-60%">80-60%</option>
                  <option value="Less than 60%">Less than 60% (60% से कम)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="reason_not_avail_midday_meals"
                  className="col-form-label"
                >
                  3.3.2 If some children do not avail midday meals, the reason
                  is- (यदि कुछ बच्चे मध्याह्न भोजन नहीं करते हैं, तो उसका कारण क्या है?)
                  {errors.reason_not_avail_midday_meals && (
                    <span className="text-danger">
                      {errors.reason_not_avail_midday_meals.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.reason_not_avail_midday_meals ? "border-danger" : ""
                  }`}
                  {...register("reason_not_avail_midday_meals", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="Lack of interest in meals">
                    Lack of interest in meals (भोजन में रुचि की कमी)
                  </option>
                  <option value="Having meals at home">
                    Having meals at home (घर पर भोजन करना)
                  </option>
                  <option value="Not satisfied with the midday meals">
                    Not satisfied with the midday meals (मध्याह्न भोजन से असंतुष्ट होना)
                  </option>
                  <option value="Other reasons">Other reasons (अन्य कारण)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="kitchen_available" className="col-form-label">
                  3.3.3 Is a kitchen-cum-store available in the school? (क्या विद्यालय में एक रसोई और भंडारण स्थान उपलब्ध है?)
                  {errors.kitchen_available && (
                    <span className="text-danger">
                      {errors.kitchen_available.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.kitchen_available ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("kitchen_available", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.kitchen_available ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("kitchen_available", {
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
                  htmlFor="lunch_prepared_clean"
                  className="col-form-label"
                >
                  3.3.4 Is lunch prepared in a clean and hygienic environment by
                  the cook? (क्या खाना पकाने के दौरान रसोइया स्वच्छ और hygienic वातावरण में भोजन तैयार करती है?)
                  {errors.lunch_prepared_clean && (
                    <span className="text-danger">
                      {errors.lunch_prepared_clean.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.lunch_prepared_clean ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("lunch_prepared_clean", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.lunch_prepared_clean ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("lunch_prepared_clean", {
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
                  htmlFor="cooks_use_aprons_caps"
                  className="col-form-label"
                >
                  3.3.5 Do cooks use aprons/caps while preparing and serving
                  midday meals? ( क्या रसोइया मध्याह्न भोजन तैयार करते और परोसते समय एप्रन/टोपियाँ पहनते हैं?)
                  {errors.cooks_use_aprons_caps && (
                    <span className="text-danger">
                      {errors.cooks_use_aprons_caps.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.cooks_use_aprons_caps ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("cooks_use_aprons_caps", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.cooks_use_aprons_caps ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("cooks_use_aprons_caps", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="kitchen_shed_clean" className="col-form-label">
                  3.3.6 Is the kitchen shed kept clean and tidy by the cook? (क्या रसोई शेड को रसोइया द्वारा स्वच्छ और व्यवस्थित रखा जाता है?)
                  {errors.kitchen_shed_clean && (
                    <span className="text-danger">
                      {errors.kitchen_shed_clean.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.kitchen_shed_clean ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("kitchen_shed_clean", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.kitchen_shed_clean ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("kitchen_shed_clean", {
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
                  htmlFor="nutrition_garden_established"
                  className="col-form-label"
                >
                  3.3.7 Is a nutrition garden established in the school? (क्या विद्यालय में पोषण बागवानी स्थापित की गई है?)
                  {errors.nutrition_garden_established && (
                    <span className="text-danger">
                      {errors.nutrition_garden_established.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.nutrition_garden_established ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("nutrition_garden_established", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.nutrition_garden_established ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("nutrition_garden_established", {
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
                  htmlFor="vegetables_produced_nutrition_garden"
                  className="col-form-label"
                >
                  3.3.8 Is the production of vegetables/greens/other items
                  carried out in the nutrition garden? (क्या पोषण बागवानी में सब्जियाँ/पत्तेदार साग/अन्य वस्तुएं उगाई जाती हैं?)
                  {errors.vegetables_produced_nutrition_garden && (
                    <span className="text-danger">
                      {errors.vegetables_produced_nutrition_garden.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.vegetables_produced_nutrition_garden
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("vegetables_produced_nutrition_garden", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.vegetables_produced_nutrition_garden
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("vegetables_produced_nutrition_garden", {
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
                  htmlFor="materials_used_in_midday_meals"
                  className="col-form-label"
                >
                  3.3.9 Are materials produced from the nutrition garden being
                  used in midday meals? (क्या पोषण बागवानी से उत्पादित सामग्री का उपयोग मध्याह्न भोजन में किया जाता है?)
                  {errors.materials_used_in_midday_meals && (
                    <span className="text-danger">
                      {errors.materials_used_in_midday_meals.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.materials_used_in_midday_meals
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("materials_used_in_midday_meals", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.materials_used_in_midday_meals
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("materials_used_in_midday_meals", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="menu_displayed" className="col-form-label">
                  3.3.10 Whether the midday meal menu displayed in the school
                  premises - – (क्या मध्याह्न भोजन का मेनू विद्यालय परिसर में प्रदर्शित किया जाता है?)
                  {errors.menu_displayed && (
                    <span className="text-danger">
                      {errors.menu_displayed.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.menu_displayed ? "border-danger" : ""
                  }`}
                  {...register("menu_displayed", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="On the wall">On the wall (दीवार पर)</option>
                  <option value="On the notice board">
                    On the notice board (नोटिस बोर्ड पर)
                  </option>
                  <option value="Menu not displayed">Menu not displayed  (मेनू प्रदर्शित नहीं किया गया)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="egg_curry_provided" className="col-form-label">
                  3.3.11 Are egg curry provided on Mondays and a boiled egg on
                  Fridays? (क्या सोमवार को अंडा करी और शुक्रवार को उबला अंडा दिया जाता है?)
                  {errors.egg_curry_provided && (
                    <span className="text-danger">
                      {errors.egg_curry_provided.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.egg_curry_provided ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("egg_curry_provided", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.egg_curry_provided ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("egg_curry_provided", {
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
                  htmlFor="students_receive_fruits_milk"
                  className="col-form-label"
                >
                  3.3.12 Do students who do not consume eggs receive fruits/milk
                  (on Mondays and Fridays)? (क्या वे छात्र जो अंडे नहीं खाते हैं, उन्हें (सोमवार और शुक्रवार को) फल/दूध दिया जाता है?)
                  {errors.students_receive_fruits_milk && (
                    <span className="text-danger">
                      {errors.students_receive_fruits_milk.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.students_receive_fruits_milk ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("students_receive_fruits_milk", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.students_receive_fruits_milk ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("students_receive_fruits_milk", {
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
                  htmlFor="midday_meal_provided_menu"
                  className="col-form-label"
                >
                  3.3.13 Is midday meal provided according to the menu in the
                  school? (क्या विद्यालय में मध्याह्न भोजन मेनू के अनुसार प्रदान किया जाता है?)
                  {errors.midday_meal_provided_menu && (
                    <span className="text-danger">
                      {errors.midday_meal_provided_menu.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.midday_meal_provided_menu ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("midday_meal_provided_menu", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.midday_meal_provided_menu ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("midday_meal_provided_menu", {
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
                  htmlFor="children_find_meals_tasty"
                  className="col-form-label"
                >
                  3.3.14 Do children find midday meals tasty? (क्या बच्चों को मध्याह्न भोजन स्वादिष्ट लगता है?)
                  {errors.children_find_meals_tasty && (
                    <span className="text-danger">
                      {errors.children_find_meals_tasty.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.children_find_meals_tasty ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("children_find_meals_tasty", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.children_find_meals_tasty ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("children_find_meals_tasty", {
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
                  htmlFor="glasses_plates_available"
                  className="col-form-label"
                >
                  3.3.15 Are glasses/plates available for students to receive
                  midday meals in the school? (क्या छात्रों को मध्याह्न भोजन प्राप्त करने के लिए ग्लास/प्लेट्स उपलब्ध हैं?)
                  {errors.glasses_plates_available && (
                    <span className="text-danger">
                      {errors.glasses_plates_available.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.glasses_plates_available ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("glasses_plates_available", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.glasses_plates_available ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("glasses_plates_available", {
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
                  htmlFor="fuel_used_for_cooking"
                  className="col-form-label"
                >
                  3.3.16 What fuel is used to cook midday meals? (मध्याह्न भोजन पकाने के लिए कौन सा ईंधन उपयोग किया जाता है?)
                  {errors.fuel_used_for_cooking && (
                    <span className="text-danger">
                      {errors.fuel_used_for_cooking.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.fuel_used_for_cooking ? "border-danger" : ""
                  }`}
                  {...register("fuel_used_for_cooking", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="LPG">LPG</option>
                  <option value="Firewood">Firewood (लकड़ी)</option>
                  <option value="Coal">Coal (कोयला)</option>
                  <option value="Other">Other (अन्य)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="who_tastes_midday_meal"
                  className="col-form-label"
                >
                  3.3.17 Who tastes (quality checks) the midday meal before
                  serving? (कौन मध्याह्न भोजन को परोसने से पहले (गुणवत्ता की जांच) करता है?)
                  {errors.who_tastes_midday_meal && (
                    <span className="text-danger">
                      {errors.who_tastes_midday_meal.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.who_tastes_midday_meal ? "border-danger" : ""
                  }`}
                  {...register("who_tastes_midday_meal", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="Teacher">Teacher (शिक्षक)</option>
                  <option value="Cook">Cook (रसोइया)</option>
                  <option value="Baal Sansad Member">Baal Sansad Member (बाल संसद सदस्य)</option>
                  <option value="All three">All three ( सभी तीनों)</option>
                  <option value="Nobody">Nobody (कोई नहीं)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="disposal_leftover_food"
                  className="col-form-label"
                >
                  3.3.18 Disposal arrangement for leftover food items? ?( बचे हुए भोजन के सामान के निस्तारण की व्यवस्था क्या है?)
                  {errors.disposal_leftover_food && (
                    <span className="text-danger">
                      {errors.disposal_leftover_food.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.disposal_leftover_food ? "border-danger" : ""
                  }`}
                  {...register("disposal_leftover_food", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="In compost pits">In compost pits (कंपोस्ट गड्ढों में)</option>
                  <option value="Within the school premises">
                    Within the school premises (विद्यालय परिसर के भीतर)
                  </option>
                  <option value="Away from the school">
                    Away from the school (विद्यालय से बाहर)
                  </option>
                  <option value="Other">Other (अन्य)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="seating_arrangement_for_mdm"
                  className="col-form-label"
                >
                  3.3.19 Seating arrangement for MDM (Do children have access to
                  clean mats/benches/any other arrangements?) (मध्याह्न भोजन के लिए बैठने की व्यवस्था (क्या बच्चों के पास साफ चटाइयाँ/बेंच/कोई अन्य व्यवस्था उपलब्ध है?))
                  {errors.seating_arrangement_for_mdm && (
                    <span className="text-danger">
                      {errors.seating_arrangement_for_mdm.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.seating_arrangement_for_mdm ? "border-danger" : ""
                  }`}
                  {...register("seating_arrangement_for_mdm", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes (हाँ)</option>
                  <option value="No">No (नहीं)</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="main_source_of_water_for_mdm"
                  className="col-form-label"
                >
                  3.3.20 What is the main source of water for cooking for
                  Mid-Day Meal (MDM) / lunch by students and cooks?  (मध्याह्न भोजन पकाने के लिए पानी का मुख्य स्रोत क्या है?)
                  {errors.main_source_of_water_for_mdm && (
                    <span className="text-danger">
                      {errors.main_source_of_water_for_mdm.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.main_source_of_water_for_mdm ? "border-danger" : ""
                  }`}
                  {...register("main_source_of_water_for_mdm", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="No water supplies available">
                    No water supplies available (कोई पानी की आपूर्ति उपलब्ध नहीं है)
                  </option>
                  <option value="Hand pump">Hand pump (हैंड पंप)</option>
                  <option value="Drums/ cement tanks/ plastic containers with water near hand washing area">
                    Drums/ cement tanks/ plastic containers with water near hand
                    washing area (ड्रम/सीमेंट टैंक/प्लास्टिक कंटेनर जिसमें पानी हाथ धोने के स्थान के पास रखा है)
                  </option>
                  <option value="Running water with taps at all the hand washing points">
                    Running water with taps at all the hand washing points points  (सभी हाथ धोने के स्थानों पर नलके साथ बहता हुआ पानी)
                  </option>
                </select>
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
