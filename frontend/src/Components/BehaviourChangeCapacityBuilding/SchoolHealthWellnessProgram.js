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

export default function SchoolHealthWellnessProgram() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");

  const { token, allSurveyData,saveallData } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch,
    trigger,
  } = useForm();

  const isTeacherTrainedForHealthRelatedIssues = watch("teacher_training_health_issues");


  const PreFillData = (allSurveyData) => {
    let primaryDatas =  (allSurveyData)?.health_wellness ;
    primaryDatas =  (typeof primaryDatas === 'string') ? JSON.parse(primaryDatas) : primaryDatas;
    console.log(primaryDatas); 
    if(primaryDatas && Object.keys(primaryDatas).length){
     Object.keys(primaryDatas).forEach((key) => {
       setValue(key, primaryDatas[key]); // Set value for the respective form field
     });
   }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login"; // You can also use <Navigate to="/login" />
    } else {
      setuserinfos(parseJwtData(token)); 
      const parsedData =  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
      if(parsedData){
        if(parsedData?.health_wellness ){
          PreFillData(parsedData);
        }
      }
    }
    setShowLoader(false);
  }, [token, allSurveyData ]);

  
  //const district3Value = watch("district3", "");

  const onSubmit = (health_data) => {
    setShowLoader(true);
    if (health_data && Object.keys(health_data).length > 0) {
     

      const mhmSurveyData=  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

        const updatedSurveyData = { ...mhmSurveyData, health_wellness: health_data };
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
        columnname:"health_wellness" ,
        data: health_data
      };
      if(sessionStorage.hasOwnProperty("SVSB_All_Data")){
        let sessionObj  = JSON.parse(sessionStorage?.SVSB_All_Data);
        sessionObj.health_wellness = JSON.stringify(health_data);
        sessionStorage.setItem('SVSB_All_Data', JSON.stringify(sessionObj));
      }
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
      <AuthMenu pageName="health_wellness_info" />
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
                  htmlFor="health_education_boys"
                  className="col-form-label"
                >
                  3.2.1 Number of students participating in health education
                  sessions and the topics covered, such as nutrition, hygiene,
                  mental health, reproductive health, violence prevention and
                  substance abuse prevention - Number of Boys (स्वास्थ्य शिक्षा सत्रों में भाग लेने वाले छात्रों की संख्या जिसमें विषयों को कवर किया गया है, जैसे कि पोषण, स्वच्छता, मानसिक स्वास्थ्य, प्रजनन स्वास्थ्य, हिंसा निवारण और मादक पदार्थों के दुरुपयोग की रोकथाम) (लड़कों की संख्या)
                  {errors.health_education_boys && (
                    <span className="text-danger">
                      {errors.health_education_boys.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  className={`form-control ${
                    errors.health_education_boys ? "border-danger" : ""
                  }`}
                  type="number"
                  {...register("health_education_boys", {
                    required: "Please provide the number of boys participating",
                  })}
                />
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="health_education_girls"
                  className="col-form-label"
                >
                  3.2.1 Number of students participating in health education
                  sessions and the topics covered, such as nutrition, hygiene,
                  mental health, reproductive health, violence prevention and
                  substance abuse prevention - Number of Girls (स्वास्थ्य शिक्षा सत्रों में भाग लेने वाले छात्रों की संख्या जिसमें विषयों को कवर किया गया है, जैसे कि पोषण, स्वच्छता, मानसिक स्वास्थ्य, प्रजनन स्वास्थ्य, हिंसा निवारण और मादक पदार्थों के दुरुपयोग की रोकथाम) (लड़कियों की संख्या)
                  {errors.health_education_girls && (
                    <span className="text-danger">
                      {errors.health_education_girls.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  className={`form-control ${
                    errors.health_education_girls ? "border-danger" : ""
                  }`}
                  type="number"
                  {...register("health_education_girls", {
                    required:
                      "Please provide the number of girls participating",
                  })}
                />
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="vaccination_percentage"
                  className="col-form-label"
                >
                  3.2.2 The percentage of students who have received the
                  required vaccinations as per the national or state
                  immunization schedule in the last one year. ( पिछले एक वर्ष में राष्ट्रीय या राज्य के टीकाकरण कार्यक्रम के अनुसार आवश्यक टीकाकरण प्राप्त करने वाले छात्रों का प्रतिशत)
                  {errors.vaccination_percentage && (
                    <span className="text-danger">
                      {errors.vaccination_percentage.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.vaccination_percentage ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="90-100%"
                    {...register("vaccination_percentage", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">90-100 %</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.vaccination_percentage ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="89-75%"
                    {...register("vaccination_percentage", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">89-75 %</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.vaccination_percentage ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="50-74%"
                    {...register("vaccination_percentage", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">50-74 %</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.vaccination_percentage ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="35-49%"
                    {...register("vaccination_percentage", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">35-49 %</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.vaccination_percentage ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Less than 34%"
                    {...register("vaccination_percentage", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Less than 34 % (34% से कम)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.vaccination_percentage ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="None"
                    {...register("vaccination_percentage", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">None (कोई नहीं)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="nutritional_status_monitor"
                  className="col-form-label"
                >
                  3.2.3 Whether the school monitors the nutritional status of
                  students, assessing their dietary habits, and promoting the
                  consumption of balanced and healthy meals? ( विद्यालय में  छात्रों की पोषण स्थिति की निगरानी कौन करता है, उनके आहार की आदतों का मूल्यांकन कौन करता है, जिससे  संतुलित और स्वस्थ भोजन के सेवन को बढ़ावा दिया जाता  है?)
                  {errors.nutritional_status_monitor && (
                    <span className="text-danger">
                      {errors.nutritional_status_monitor.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.nutritional_status_monitor ? "border-danger" : ""
                  }`}
                  {...register("nutritional_status_monitor", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="Teachers">Teachers (शिक्षक)</option>
                  <option value="Health Club/Baal Sansad">
                    Health Club/Baal Sansad (स्वास्थ्य क्लब/बाल संसद)
                  </option>
                  <option value="Students">Students (छात्र)</option>
                  <option value="Trained medical staff">
                    Trained medical staff (प्रशिक्षित चिकित्सा कर्मचारी)
                  </option>
                  <option value="Others">Others (अन्य)</option>
                  <option value="None">None (कोई नहीं)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="physical_activity_monitor"
                  className="col-form-label"
                >
                  3.2.4 Who does the tracking of the level of physical activity
                  among students, including participation in sports and other
                  physical education activities? (छात्रों में शारीरिक गतिविधि के स्तर को कौन ट्रैक करता है, जिसमें खेल और अन्य शारीरिक शिक्षा गतिविधियों में भागीदारी शामिल है?)
                  {errors.physical_activity_monitor && (
                    <span className="text-danger">
                      {errors.physical_activity_monitor.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.physical_activity_monitor ? "border-danger" : ""
                  }`}
                  {...register("physical_activity_monitor", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="Teachers">Teachers (शिक्षक)</option>
                  <option value="Health Club/Baal Sansad">
                    Health Club/Baal Sansad (स्वास्थ्य क्लब/बाल संसद)
                  </option>
                  <option value="Students">Students (छात्र)</option>
                  <option value="Trained medical staff">
                    Trained medical staff (प्रशिक्षित चिकित्सा कर्मचारी)
                  </option>
                  <option value="Others">Others (अन्य)</option>
                  <option value="None">None (कोई नहीं)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="mental_health_assessment"
                  className="col-form-label"
                >
                  3.2.5 Whether the assessment is done for the availability and
                  utilization of mental health resources and support services
                  for students? (क्या छात्रों के लिए मानसिक स्वास्थ्य संसाधनों और सहायता सेवाओं की उपलब्धता और उपयोगिता का मूल्यांकन किया गया है?)
                  {errors.mental_health_assessment && (
                    <span className="text-danger">
                      {errors.mental_health_assessment.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.mental_health_assessment ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("mental_health_assessment", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.mental_health_assessment ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("mental_health_assessment", {
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
                  htmlFor="health_services_quality_evaluation"
                  className="col-form-label"
                >
                  3.2.6 Whether the evaluation is done for the accessibility and
                  quality of health services provided in school infirmaries
                  (weaknesses)?  (क्या विद्यालय के बच्चों में स्वास्थ्य सेवाओं की पहुँच और गुणवत्ता  (कमजोरी ) का मूल्यांकन किया गया है?)
                  {errors.health_services_quality_evaluation && (
                    <span className="text-danger">
                      {errors.health_services_quality_evaluation.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.health_services_quality_evaluation
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("health_services_quality_evaluation", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.health_services_quality_evaluation
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("health_services_quality_evaluation", {
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
                  htmlFor="regular_health_screening"
                  className="col-form-label"
                >
                  3.2.7 Whether regular health screenings are conducted to
                  identify health issues early on, such as vision and hearing
                  tests, dental check-ups, etc.? (क्या नियमित स्वास्थ्य जांच की जाती है ताकि स्वास्थ्य समस्याओं की प्रारंभिक पहचान किया जा सके, जैसे कि दृष्टि और श्रवण परीक्षण, दंत परीक्षण आदि?)
                  {errors.regular_health_screening && (
                    <span className="text-danger">
                      {errors.regular_health_screening.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.regular_health_screening ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("regular_health_screening", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.regular_health_screening ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("regular_health_screening", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="safety_assessment" className="col-form-label">
                  3.2.8 Whether an assessment was done in the last one year
                  about the overall physical and emotional safety of the school
                  environment? (क्या पिछले एक वर्ष में विद्यालय के शारीरिक और मानसिक सुरक्षा का मूल्यांकन किया गया है?)
                  {errors.safety_assessment && (
                    <span className="text-danger">
                      {errors.safety_assessment.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.safety_assessment ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("safety_assessment", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.safety_assessment ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("safety_assessment", {
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
                  htmlFor="parental_engagement_community_support"
                  className="col-form-label"
                >
                  3.2.9 Whether any activity was done in the last year about
                  measuring the level of parental engagement and community
                  support in promoting health and wellness initiatives? (क्या पिछले एक वर्ष में माता-पिता की भागीदारी और सामुदायिक समर्थन को मापने के लिए कोई गतिविधि की गई है, ताकि स्वास्थ्य और कल्याण पहलों को बढ़ावा दिया जा सके?)
                  {errors.parental_engagement_community_support && (
                    <span className="text-danger">
                      {errors.parental_engagement_community_support.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.parental_engagement_community_support
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("parental_engagement_community_support", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.parental_engagement_community_support
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("parental_engagement_community_support", {
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
                  htmlFor="teacher_training_health_issues"
                  className="col-form-label"
                >
                  3.2.10 Whether the teachers are adequately trained to handle
                  health-related issues and deliver health education
                  effectively? (क्या शिक्षकों को स्वास्थ्य संबंधी मुद्दों को संभालने और प्रभावी रूप से स्वास्थ्य शिक्षा देने के लिए पर्याप्त रूप से प्रशिक्षित किया गया है?)
                  {errors.teacher_training_health_issues && (
                    <span className="text-danger">
                      {errors.teacher_training_health_issues.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.teacher_training_health_issues
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("teacher_training_health_issues", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.teacher_training_health_issues
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("teacher_training_health_issues", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">No (नहीं)</label>
                </div>
              </div>
            </div>
            {isTeacherTrainedForHealthRelatedIssues === "Yes" && (
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="trained_teachers_number"
                  className="col-form-label"
                >
                  3.2.11 If yes for Q. No. 10, then number of teachers trained:........(यदि प्रश्न संख्या 10 के लिए हाँ है, तो प्रशिक्षित शिक्षकों की संख्या ........)(संख्या)
                  {errors.trained_teachers_number && (
                    <span className="text-danger">
                      {errors.trained_teachers_number.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  className={`form-control ${
                    errors.trained_teachers_number ? "border-danger" : ""
                  }`}
                  type="number"
                  {...register("trained_teachers_number", {
                    required: "Please provide the number of trained teachers",
                  })}
                />
              </div>
            </div>
            )}

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="health_data_collection_system"
                  className="col-form-label"
                >
                  3.2.12 Is there any system established in school for
                  collecting data on health indicators and reporting the results
                  to relevant authorities? (क्या विद्यालय में स्वास्थ्य संकेतकों पर डेटा संग्रहण और संबंधित अधिकारियों को रिपोर्टिंग के लिए कोई प्रणाली स्थापित की गई है?)
                  {errors.health_data_collection_system && (
                    <span className="text-danger">
                      {errors.health_data_collection_system.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.health_data_collection_system
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("health_data_collection_system", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.health_data_collection_system
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("health_data_collection_system", {
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
                  htmlFor="albendazole_tablets_provided"
                  className="col-form-label"
                >
                  3.2.13 Whether your school has provided Albendazole tablets
                  for deworming in the last 6 months? (क्या आपके विद्यालय ने पिछले 6 महीने में कृमि के लिए अल्बेंडाजोल टैबलेट्स प्रदान किए हैं?) 
                  {errors.albendazole_tablets_provided && (
                    <span className="text-danger">
                      {errors.albendazole_tablets_provided.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.albendazole_tablets_provided ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("albendazole_tablets_provided", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.albendazole_tablets_provided ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("albendazole_tablets_provided", {
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
                  htmlFor="health_checkup_frequency"
                  className="col-form-label"
                >
                  3.2.14 How often does your school conduct health checkup? (आपका विद्यालय कितनी बार स्वास्थ्य जांच करता है?)
                  {errors.health_checkup_frequency && (
                    <span className="text-danger">
                      {errors.health_checkup_frequency.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.health_checkup_frequency ? "border-danger" : ""
                  }`}
                  {...register("health_checkup_frequency", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="Monthly">Monthly (मासिक)</option>
                  <option value="Bi-monthly">Bi-monthly (द्वैमासिक)</option>
                  <option value="Once in six months">Once in six months (छह महीने में एक बार)</option>
                  <option value="Annually">Annually (वार्षिक)</option>
                  <option value="Not fixed">Not fixed (तय नहीं)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="anemia_screening" className="col-form-label">
                  3.2.15 Whether children have been screened/tested for anemia
                  in the last 1 year? (क्या आपके विद्यालय में पिछले 1 वर्ष में बच्चों का एनीमिया के लिए परीक्षण/स्क्रीनिंग की गई है?)
                  {errors.anemia_screening && (
                    <span className="text-danger">
                      {errors.anemia_screening.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.anemia_screening ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("anemia_screening", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.anemia_screening ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("anemia_screening", {
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
                  htmlFor="ifa_tablets_available"
                  className="col-form-label"
                >
                  3.2.16 Whether IFA (Iron and folic acid) Blue tablets are
                  currently available at your school?  (क्या आपके विद्यालय में IFA (आयरन और फोलिक एसिड) नीले टैबलेट्स वर्तमान में उपलब्ध हैं?)
                  {errors.ifa_tablets_available && (
                    <span className="text-danger">
                      {errors.ifa_tablets_available.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.ifa_tablets_available ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("ifa_tablets_available", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.ifa_tablets_available ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("ifa_tablets_available", {
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
                  htmlFor="ifa_tablets_distribution_report"
                  className="col-form-label"
                >
                  3.2.17 How often does your school send Iron Folic Acid Blue
                  Tablets distribution details/report? (आपके विद्यालय में IFA नीले टैबलेट्स वितरण विवरण/रिपोर्ट कितनी बार भेजी जाती है?)
                  {errors.ifa_tablets_distribution_report && (
                    <span className="text-danger">
                      {errors.ifa_tablets_distribution_report.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.ifa_tablets_distribution_report
                      ? "border-danger"
                      : ""
                  }`}
                  {...register("ifa_tablets_distribution_report", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="Weekly Basis">Weekly Basis (साप्ताहिक आधार पर)</option>
                  <option value="Fortnightly">Fortnightly (पखवाड़े में)</option>
                  <option value="Monthly">Monthly (मासिक)</option>
                  <option value="Bi-monthly">Bi-monthly (द्वैमासिक)</option>
                  <option value="Quarterly">Quarterly (त्रैमासिक)</option>
                  <option value="Once in six months">Once in six months (छह महीने में एक बार)</option>
                  <option value="Annually">Annually (वार्षिक)</option>
                  <option value="No fixed time">No fixed time (निश्चित समय नहीं)</option>
                  <option value="Not sent">Not sent (नहीं भेजा जाता)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="ifa_tablets_out_of_stock"
                  className="col-form-label"
                >
                  3.2.18 Did your school run out of stock of IFA blue tablets in
                  the last 6 months? (क्या आपके विद्यालय ने पिछले 6 महीने में IFA नीले टैबलेट्स का स्टॉक खत्म हो गया था?)
                  {errors.ifa_tablets_out_of_stock && (
                    <span className="text-danger">
                      {errors.ifa_tablets_out_of_stock.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.ifa_tablets_out_of_stock ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("ifa_tablets_out_of_stock", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.ifa_tablets_out_of_stock ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("ifa_tablets_out_of_stock", {
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
                  htmlFor="school_health_program_bell"
                  className="col-form-label"
                >
                  3.2.19 Is the weekly bell for the School Health and Wellness
                  Program indicated in the school timetable? (क्या विद्यालय स्वास्थ्य और कल्याण कार्यक्रम के लिए साप्ताहिक घंटी विद्यालय टाइमटेबल में निर्धारित है?)
                  {errors.school_health_program_bell && (
                    <span className="text-danger">
                      {errors.school_health_program_bell.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_health_program_bell ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("school_health_program_bell", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_health_program_bell ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("school_health_program_bell", {
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
                  htmlFor="weekly_health_sessions"
                  className="col-form-label"
                >
                  3.2.20 Are weekly sessions organized in classrooms under the
                  School Health and Wellness Program by trained Health and
                  Wellness Ambassadors? (क्या प्रशिक्षित स्वास्थ्य और कल्याण एम्बेसडर द्वारा विद्यालय स्वास्थ्य और कल्याण कार्यक्रम के तहत कक्षाओं में साप्ताहिक सत्र आयोजित किए जाते हैं?)
                  {errors.weekly_health_sessions && (
                    <span className="text-danger">
                      {errors.weekly_health_sessions.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.weekly_health_sessions ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Every week"
                    {...register("weekly_health_sessions", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Every week (हर सप्ताह)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.weekly_health_sessions ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Sometimes"
                    {...register("weekly_health_sessions", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Sometimes (कभी-कभी)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.weekly_health_sessions ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="Never"
                    {...register("weekly_health_sessions", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Never (कभी नहीं)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="student_attendance_weekly_sessions"
                  className="col-form-label"
                >
                  3.2.21 What is the average student attendance in the weekly
                  sessions conducted under the School Health and Wellness
                  Program? (विद्यालय स्वास्थ्य और कल्याण कार्यक्रम के तहत साप्ताहिक सत्रों में छात्रों की औसत उपस्थिति क्या है?)
                  {errors.student_attendance_weekly_sessions && (
                    <span className="text-danger">
                      {errors.student_attendance_weekly_sessions.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <select
                  className={`form-control ${
                    errors.student_attendance_weekly_sessions
                      ? "border-danger"
                      : ""
                  }`}
                  {...register("student_attendance_weekly_sessions", {
                    required: "Please select one option",
                  })}
                >
                  <option value="">Select</option>
                  <option value="Above 80%">Above 80% ( 80% से अधिक)</option>
                  <option value="Above 70%">Above 70% ( 70% से अधिक)</option>
                  <option value="Above 60%">Above 60% ( 60% से अधिक)</option>
                  <option value="Above 50%">Above 50% ( 50% से अधिक)</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="discussion_health_program_assembly"
                  className="col-form-label"
                >
                  3.2.22 Is discussion on topics related to the School Health
                  and Wellness Program conducted during the school assembly? (क्या विद्यालय सभा के दौरान विद्यालय स्वास्थ्य और कल्याण कार्यक्रम से संबंधित विषयों पर चर्चा की जाती है?)
                  {errors.discussion_health_program_assembly && (
                    <span className="text-danger">
                      {errors.discussion_health_program_assembly.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.discussion_health_program_assembly
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="Yes"
                    {...register("discussion_health_program_assembly", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label">Yes (हाँ)</label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.discussion_health_program_assembly
                        ? "border-danger"
                        : ""
                    }`}
                    type="radio"
                    value="No"
                    {...register("discussion_health_program_assembly", {
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
