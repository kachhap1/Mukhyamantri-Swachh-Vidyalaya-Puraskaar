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

export default function PrimaryInfo() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");
  const [hidePanchayat, sethidePanchayat] = useState(false);
  const [hideVillage, sethideVillage] = useState(false);
  const [disbaleSaveBtn, setDisableSaveBtn] =useState(false);

  const [showUrbanBodyName, setshowUrbanBodyName] = useState(false);
  const [showWardName, setshowWardName] = useState(false);

  const { token,allSurveyData,saveSchoolPrimaryInfo,saveallData  } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch,
    trigger,
  } = useForm();

  const functionalBaalSansad = watch("functional_Baal_Sansad_in_school_q32");
  const functionalJalSena = watch("functional_Jal_sena_q34");
  const schoolSVPAwards = watch("school_awards_svp_q37");
  const schoolMSVPAwards = watch("school_awards_msvp_q39");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login"; // You can also use <Navigate to="/login" />
    } else {
      setuserinfos(parseJwtData(token));
      const parsedData =  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;
        if (parsedData?.primary_info ?? parsedData?.school_master) {
          PreFillData(parsedData);
        }
       
    }
    setShowLoader(false);
  }, [token]);


  const PreFillData =(allSurveyData)=>{  

    let primaryDatas = (allSurveyData)?.primary_info ?? (allSurveyData)?.school_master;
    console.log(primaryDatas); 
    primaryDatas =  (typeof primaryDatas === 'string') ? JSON.parse(primaryDatas) : primaryDatas;


    const schoolMasterDatas = primaryDatas;

    console.log(schoolMasterDatas);
      setValue("udise_code",schoolMasterDatas?.udise_code);
      if(schoolMasterDatas?.udise_code && !schoolMasterDatas?.establishment){
        getSchoolData("getSchoolInfos.php", JSON.stringify({ udise_code: schoolMasterDatas?.udise_code }));
       // setDisableSaveBtn(true);
      }

    //  const primaryDatas = JSON.parse( JSON.parse(allSurveyData).primary_info);
    //  console.log(primaryDatas); 
     primaryDatas &&  Object.keys(primaryDatas).forEach((key) => {
      setValue(key, primaryDatas[key]); // Set value for the respective form field
    });
    if (primaryDatas?.location_school_urbanrural11 === "2-Urban") {
       
      sethidePanchayat(true);
      sethideVillage(true);
      setshowUrbanBodyName(true);
      setshowWardName(true);
      setValue(
        "urban_body_name5",
        primaryDatas?.urban_body_name5
      );
      setValue("ward_name6", primaryDatas?.ward_name6);
    } else {
      setValue("panchayat5", primaryDatas?.panchayat5);
      setValue("village6", primaryDatas?.village6);
    }
  }
  //const district3Value = watch("district3", "");

  const onSubmit = (data) => {
    setShowLoader(true);
    if (data && Object.keys(data).length > 0) {
      const updatedData = {
        ...data, // existing data from the form
      };
      //console.log(updatedData);

      const mhmSurveyData=  (typeof allSurveyData === 'string') ? JSON.parse(allSurveyData) : allSurveyData;

      const updatedSurveyData = { ...mhmSurveyData, primary_info: data };
      saveallData(updatedSurveyData);


      saveSchoolPrimaryInfo(updatedData);
      showNotificationMsg("success", "Please Wait ...", {
        autoClose: 3000,
      });
      // setTimeout(() => {
      //   nav("/user/water");
      // }, 1500);

      const jsonObject = {
        udise_code: userinfos.udise_code,
        mobile: userinfos.mobile,
        columnname:"primary_info" ,
        data: updatedData
      }; 
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

  const handleGetSchoolInfos = (e) => {
    if (e.target.value.length === 11) {
      setShowLoader(true);
      const udiseCode = e.target.value;
      const data = { udise_code: udiseCode };
      sethidePanchayat(false);
      sethideVillage(false);
      setshowUrbanBodyName(false);
      setshowWardName(false);
      getSchoolData("getSchoolInfos.php", JSON.stringify(data));
    }
  };
  const getSchoolData = async (endpoint, jsonData) => {
    try {
      const response = await apiJSONPost(endpoint, jsonData);
      console.log(response);
      if (
        response?.data?.statuscode === 200 &&
        response?.data?.title === "Success"
      ) {
        if (typeof response?.data?.message === "object") {
          showNotificationMsg("success", "Please Wait ...", {
            autoClose: 3000,
          });
          setValue("school_name2", response?.data?.message?.school_name);
          setValue("district3", response?.data?.message?.district_name);
          setValue("block4", response?.data?.message?.block_name);

          if (response?.data?.message?.school_location === "2-Urban") {
            //alert("School Urban");
            showNotificationMsg("info", "Urban School", {
              autoClose: 2000,
            });
            sethidePanchayat(true);
            sethideVillage(true);
            setshowUrbanBodyName(true);
            setshowWardName(true);
            setValue(
              "urban_body_name5",
              response?.data?.message?.lgd_urban_local_body_name
            );
            setValue("ward_name6", response?.data?.message?.lgd_ward_name);
          } else {
            setValue("panchayat5", response?.data?.message?.lgd_panchayat_name);
            setValue("village6", response?.data?.message?.lgd_vill_name);
          }
          setValue("school_category7", response?.data?.message?.management);
          setValue("school_category8", response?.data?.message?.category);
          setValue(
            "type_school9",
            response?.data?.message?.type === "3-Co-ed"
              ? response?.data?.message?.type
              : ""
          );

          setValue(
            "use_school_premises10",
            response?.data?.message?.use_school_premises === null? "Single School - Single shift": response?.data?.message?.use_school_premises
          );
          setValue(
            "location_school_urbanrural11",
            response?.data?.message?.school_location
          );
          setValue(
            "school_type_use12",
            response?.data?.message?.school_location
          );
          setValue(
            "Longitude",
            response?.data?.message?.longitude
          );
          setValue(
            "Latitude",
            response?.data?.message?.latitude
          );
          setValue(
            "name_respondent17",
            userinfos?.respondant_name
          ); 
          setValue(
            "designation_respondent18",
            userinfos?.designation
          );
          setValue(
            "contact_respondent_mobile",
            userinfos?.mobile
          );
           
          //setValue("location_school_urbanrural11", response?.data?.message?.location_school_ulb);
          //setValue("school_category7", response?.data?.message?.management);
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
      <AuthMenu pageName="primary_info" />
      <p className="text-center">
        No marking to consider for MSVP-award, just for information collection(MSVP पुरस्कार के लिए कोई अंक नहीं – केवल सूचना संग्रह के लिए)
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
                <label htmlFor="udise_code" className="col-form-label">
                  1. U-DISE Code (U-DISE कोड)
                  {errors.udise_code && (
                    <span className="text-danger">
                      {errors.udise_code.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  name="udise_code"
                  autoComplete="off"
                  className={`form-control ${
                    errors.udise_code ? "border-danger" : ""
                  }`}
                  type="text"
                  maxLength={11}
                  {...register("udise_code", {
                    required: "*",
                    maxLength: {
                      value: 11,
                      message: "Maximum length is 11 characters",
                    },
                    pattern: {
                      value: /^[0-9]*$/,
                      message: "Only numbers are allowed",
                    },
                  })}
                  onChange={handleGetSchoolInfos}
                  onBlur={handleInputChange}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="school_name2" className="col-form-label">
                  2. Name of School(विद्यालय का नाम)
                  {errors.school_name2 && (
                    <span className="text-danger">
                      {errors.school_name2.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  name="school_name2"
                  autoComplete="off"
                  className={`form-control ${
                    errors.school_name2 ? "border-danger" : "border-none"
                  }`}
                  type="text"
                  {...register("school_name2", {
                    required: "*",
                  })}
                  onBlur={handleInputChange}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="district3" className="col-form-label">
                  3. District{" "}
                  {errors.district3 && (
                    <span className="text-danger">
                      {errors.district3.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  name="district3"
                  autoComplete="off"
                  className={`form-control ${
                    errors.district3 ? "border-danger" : ""
                  }`}
                  type="text"
                  {...register("district3", {
                    required: "*",
                  })}
                  onBlur={handleInputChange}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="block4" className="col-form-label">
                  4. Block( प्रखंड)
                  {errors.block4 && (
                    <span className="text-danger">{errors.block4.message}</span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  name="block4"
                  autoComplete="off"
                  className={`form-control ${
                    errors.block4 ? "border-danger" : ""
                  }`}
                  type="text"
                  {...register("block4", {
                    required: "*",
                  })}
                  onBlur={handleInputChange}
                />
              </div>
            </div>

            {!hidePanchayat && (
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label htmlFor="panchayat5" className="col-form-label">
                    5. Panchayat( पंचायत)
                    {errors.panchayat5 && (
                      <span className="text-danger">
                        {errors.panchayat5.message}
                      </span>
                    )}
                  </label>
                </div>
                <div className="col-md-4">
                  <input
                    name="panchayat5"
                    autoComplete="off"
                    className={`form-control ${
                      errors.panchayat5 ? "border-danger" : ""
                    }`}
                    type="text"
                    {...register("panchayat5", {
                      required: "*",
                    })}
                    onBlur={handleInputChange}
                  />
                </div>
              </div>
            )}
            {showUrbanBodyName && (
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label htmlFor="urban_body_name5" className="col-form-label">
                    5. Urban Body Name{" "}
                    {errors.urban_body_name5 && (
                      <span className="text-danger">
                        {errors.urban_body_name5.message}
                      </span>
                    )}
                  </label>
                </div>
                <div className="col-md-4">
                  <input
                    name="urban_body_name5"
                    autoComplete="off"
                    className={`form-control ${
                      errors.urban_body_name5 ? "border-danger" : ""
                    }`}
                    type="text"
                    {...register("urban_body_name5", {
                      required: "*",
                    })}
                    onBlur={handleInputChange}
                  />
                </div>
              </div>
            )}
            {!hideVillage && (
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label htmlFor="village6" className="col-form-label">
                    6. Village{" "}
                    {errors.village6 && (
                      <span className="text-danger">
                        {errors.village6.message}
                      </span>
                    )}
                  </label>
                </div>
                <div className="col-md-4">
                  <input
                    name="village6"
                    autoComplete="off"
                    className={`form-control ${
                      errors.village6 ? "border-danger" : ""
                    }`}
                    type="text"
                    {...register("village6", {
                      required: "*",
                    })}
                    onBlur={handleInputChange}
                  />
                </div>
              </div>
            )}
            {showWardName && (
              <div className="row mb-2">
                <div className="col-md-4 offset-md-2">
                  <label htmlFor="ward_name6" className="col-form-label">
                    6. Ward Name{" "}
                    {errors.ward_name6 && (
                      <span className="text-danger">
                        {errors.ward_name6.message}
                      </span>
                    )}
                  </label>
                </div>
                <div className="col-md-4">
                  <input
                    name="ward_name6"
                    autoComplete="off"
                    className={`form-control ${
                      errors.ward_name6 ? "border-danger" : ""
                    }`}
                    type="text"
                    {...register("ward_name6", {
                      required: "*",
                    })}
                    onBlur={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="village6" className="col-form-label">
                  7. Category of School(विद्यालय की श्रेणी)
                  {errors.school_category7 && (
                    <span className="text-danger">
                      {errors.school_category7.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.use_school_premises10 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="governmentSchools"
                    value="Government schools"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="governmentSchools"
                  >
                    Government schools(सरकारी विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="kgbv"
                    value="Govt- Kasturba Gandhi Balika Vidyalaya (KGBV)"
                  />
                  <label className="form-check-label" htmlFor="kgbv">
                    Govt- Kasturba Gandhi Balika Vidyalaya (KGBV)(कस्तूरबा गांधी बालिका विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="nscbav"
                    value="Govt-Netaji Subhash Chandra Bose Avaasiy Vidyalay (NSCBAV)"
                  />
                  <label className="form-check-label" htmlFor="nscbav">
                    Govt-Netaji Subhash Chandra Bose Avaasiy Vidyalay (NSCBAV)(नेताजी सुभाष चंद्र बोस आवासीय विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="csoe"
                    value="Govt- CM SoE schools"
                  />
                  <label className="form-check-label" htmlFor="csoe">
                    Govt- CM SoE schools(मुख्यमंत्री उत्कृष्ट विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="blockLevel"
                    value="Govt- Block Level Aadarsh Vidyalay"
                  />
                  <label className="form-check-label" htmlFor="blockLevel">
                    Govt- Block Level Aadarsh Vidyalay(प्रखंड स्तरीय आदर्श विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="pmShree"
                    value="Govt- PM Shree school"
                  />
                  <label className="form-check-label" htmlFor="pmShree">
                    Govt- PM Shree school(पीएम श्री विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="ekalavya"
                    value="Govt- Ekalavya Model Residential School"
                  />
                  <label className="form-check-label" htmlFor="ekalavya">
                    Govt- Ekalavya Model Residential School(एकलव्य मॉडल आवासीय विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="govtAided"
                    value="Government-aided Schools"
                  />
                  <label className="form-check-label" htmlFor="govtAided">
                    Government-aided Schools(सरकारी सहायता प्राप्त विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="kendriyaVidyalaya"
                    value="Kendriya Vidyalaya"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="kendriyaVidyalaya"
                  >
                    Kendriya Vidyalaya(केंद्रीय विद्यालय) 
                  </label>
                </div>
                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="navodyaVidyalaya"
                    value="Navodya Vidyalaya (JNV)"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="navodyaVidyalaya"
                  >
                    Navodya Vidyalaya (JNV)(नवोदय विद्यालय)
                  </label>
                </div>
                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="sainikSchool"
                    value="Sainik School"
                  />
                  <label className="form-check-label" htmlFor="sainikSchool">
                    Sainik School(सैनिक स्कूल)
                  </label>
                </div>
                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="privateSchools"
                    value="Private Schools"
                  />
                  <label className="form-check-label" htmlFor="privateSchools">
                    Private Schools(निजी विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_category7 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category7"
                    {...register("school_category7" , {
                      required: "*",
                    })}
                    id="others"
                    value="Others"
                  />
                  <label className="form-check-label" htmlFor="others">
                  Others (अन्य)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="village6" className="col-form-label">
                  8. Category of school(विद्यालय की श्रेणी )
                  {errors.school_category8 && (
                    <span className="text-danger">
                      {errors.school_category8.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_category8 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="primary1to5"
                    value="Primary only with grades 1-5"
                  />
                  <label className="form-check-label" htmlFor="primary1to5">
                    Primary only with grades 1-5(केवल प्राथमिक, कक्षा 1-5)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_category8 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="upperPrimary1to8"
                    value="Upper primary with grades 1-8"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="upperPrimary1to8"
                  >
                    Upper primary with grades 1-8(उच्च प्राथमिक, कक्षा 1-8)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_category8 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="higherSecondary1to12"
                    value="Higher secondary with grades 1-12"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="higherSecondary1to12"
                  >
                    Higher secondary with grades 1-12(उच्च माध्यमिक, कक्षा 1-12)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_category8 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="upperPrimary6to8"
                    value="Upper Primary only with grades 6-8"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="upperPrimary6to8"
                  >
                    Upper Primary only with grades 6-8(केवल उच्च प्राथमिक, कक्षा 6-8)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_category8 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="higherSecondary6to12"
                    value="Higher secondary with grades 6-12"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="higherSecondary6to12"
                  >
                    Higher secondary with grades 6-12(उच्च माध्यमिक, कक्षा 6-12)
                  </label>
                </div>

                <div className="form-check">
                  <input
                   className={`form-check-input ${
                    errors.school_category8 ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="secondarySrSecondary1to10"
                    value="Secondary/ Sr. Secondary with grades 1-10"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="secondarySrSecondary1to10"
                  >
                    Secondary/ Sr. Secondary with grades 1-10(माध्यमिक/ उच्च माध्यमिक, कक्षा 1-10)
                  </label>
                </div>

                <div className="form-check">
                  <input
                   className={`form-check-input ${
                    errors.school_category8 ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="secondarySrSecondary6to10"
                    value="Secondary/ Sr. Secondary with grades 6-10"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="secondarySrSecondary6to10"
                  >
                    Secondary/ Sr. Secondary with grades 6-10(माध्यमिक/ उच्च माध्यमिक, कक्षा 6-10)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_category8 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="secondarySrSecondary9to10"
                    value="Secondary/ Sr. Secondary only with grades 9 & 10"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="secondarySrSecondary9to10"
                  >
                    Secondary/ Sr. Secondary only with grades 9 & 10(केवल माध्यमिक/ उच्च माध्यमिक, कक्षा 9 & 10)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_category8 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="higherSecondary9to12"
                    value="Higher secondary with grade 9-12"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="higherSecondary9to12"
                  >
                    Higher secondary with grade 9-12(उच्च माध्यमिक, कक्षा 9-12)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_category8 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_category8"
                    {...register("school_category8" , {
                      required: "*",
                    })}
                    id="higherSecondaryJrCollege11to12"
                    value="Higher secondary/ Jr. College only with grades 11 & 12"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="higherSecondaryJrCollege11to12"
                  >
                    Higher secondary/ Jr. College only with grades 11 & 12(केवल उच्च माध्यमिक/ जूनियर कॉलेज, कक्षा 11 & 12)
                  </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="type_school9" className="col-form-label">
                  9. Type of School(विद्यालय का प्रकार )
                  {errors.type_school9 && (
                    <span className="text-danger">
                      {errors.type_school9.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.type_school9 ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="1-Boys"
                    id="9school_type_1_boys"
                    {...register("type_school9", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label" htmlFor="9school_type_1_boys">All boys’ school(केवल बालकों का विद्यालय)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.type_school9 ? "border-danger" : ""
                    }`}
                    type="radio"  id="9school_type_2_Girls"
                    value="2-Girls"
                    {...register("type_school9", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label" htmlFor="9school_type_2_Girls">All girls’ school (केवल बालिकाओं का विद्यालय)</label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.type_school9 ? "border-danger" : ""
                    }`}
                    type="radio"
                    value="3-Co-ed"  id="9school_type_3_Co_ed"
                    {...register("type_school9", {
                      required: "Please select one option",
                    })}
                  />
                  <label className="form-check-label" htmlFor="9school_type_3_Co_ed">Co-education (सहशिक्षा विद्यालय)</label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="use_school_premises10"
                  className="col-form-label"
                >
                  10. Usage of school premises( विद्यालय परिसर का उपयोग)
                  {errors.use_school_premises10 && (
                    <span className="text-danger">
                      {errors.use_school_premises10.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.use_school_premises10 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="use_school_premises10"
                    {...register("use_school_premises10", {
                      required: "Please select one option",
                    })}
                    id="singleShift"
                    value="Single School - Single shift"
                  />
                  <label className="form-check-label" htmlFor="singleShift">
                    Single School - Single shift(एकल विद्यालय – एक  पाली)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.use_school_premises10 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="use_school_premises10"
                    {...register("use_school_premises10", {
                      required: "Please select one option",
                    })}
                    id="doubleShift"
                    value="Single School - Double shift"
                  />
                  <label className="form-check-label" htmlFor="doubleShift">
                    Single School - Double shift(एकल विद्यालय - दो पाली)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.use_school_premises10 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="use_school_premises10"
                    {...register("use_school_premises10", {
                      required: "Please select one option",
                    })}
                    id="multipleSchools"
                    value="Multiple Schools on premises with different U-DISE codes"
                  />
                  <label className="form-check-label" htmlFor="multipleSchools">
                    Multiple Schools on premises with different U-DISE codes(एक ही परिसर में विभिन्न U-DISE कोड वाले कई विद्यालय)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.use_school_premises10 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="use_school_premises10"
                    {...register("use_school_premises10", {
                      required: "Please select one option",
                    })}
                    id="multiCampus"
                    value="Single school that runs in more than one campus"
                  />
                  <label
                    className={`form-check-label ${
                      errors.use_school_premises10 ? "text-danger" : ""
                    }`}
                    htmlFor="multiCampus"
                  >
                    Single school that runs in more than one campus(एक  विद्यालय जो एक से अधिक परिसर में चलता है)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="location_school_urbanrural11"
                  className="col-form-label"
                >
                  11. Location of the School(विद्यालय का स्थान )
                  {errors.location_school_urbanrural11 && (
                    <span className="text-danger">
                      {errors.location_school_urbanrural11.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.location_school_urbanrural11 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="location_school_urbanrural11"
                    {...register("location_school_urbanrural11", {
                      required: "*",
                    })}
                    id="Rural_Area"
                    value="1-Rural"
                  />
                  <label className="form-check-label" htmlFor="Rural_Area">
                    Rural Area(ग्रामीण क्षेत्र)
                  </label>
                </div>
                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.location_school_urbanrural11 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="location_school_urbanrural11"
                    {...register("location_school_urbanrural11", {
                      required: "*",
                    })}
                    id="Urban_Area"
                    value="2-Urban"
                  />
                  <label className="form-check-label" htmlFor="Urban_Area">
                    Urban Area(शहरी क्षेत्र)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="village6" className="col-form-label">
                  12. School type (use)(विद्यालय का प्रकार )
                  {errors.school_type_use12 && (
                    <span className="text-danger">
                      {errors.school_type_use12.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_type_use12 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_type_use12"
                    {...register("school_type_use12", {
                      required: "*",
                    })}
                    id="Residential"
                    value="Residential"
                  />
                  <label className="form-check-label" htmlFor="Residential">
                    Residential(आवासीय)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_type_use12 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_type_use12"
                    {...register("school_type_use12", {
                      required: "*",
                    })}
                    id="Non-residential"
                    value="Non-residential"
                  />
                  <label className="form-check-label" htmlFor="Non-residential">
                    Non-residential(गैर-आवासीय)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="type_board13" className="col-form-label">
                  13. Type of Board(बोर्ड का प्रकार )
                  {errors.type_board13 && (
                    <span className="text-danger">
                      {errors.type_board13.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.type_board13 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="type_board13"
                    {...register("type_board13", {
                      required: "*",
                    })}
                    id="CBSE_ICSE"
                    value="CBSE / ICSE"
                  />
                  <label className="form-check-label" htmlFor="CBSE_ICSE">
                    CBSE / ICSE
                  </label>
                </div>
                <div className="form-check">
                  <input
                  className={`form-check-input ${
                    errors.type_board13 ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="type_board13"
                    {...register("type_board13", {
                      required: "*",
                    })}
                    id="JAC"
                    value="JAC"
                  />
                  <label className="form-check-label" htmlFor="JAC">
                    JAC
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.type_board13 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="type_board13"
                    {...register("type_board13", {
                      required: "*",
                    })}
                    id="type_boardOthers"
                    value="Others"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="type_boardOthers"
                  >
                    Others(अन्य)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="establishment" className="col-form-label">
                  14. Establishment of the School(विद्यालय की स्थापना वर्ष)
                  {errors.establishment && (
                    <span className="text-danger">
                      {errors.establishment.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  name="establishment"
                  autoComplete="off"
                  className={`form-control ${
                    errors.establishment ? "border-danger" : ""
                  }`}
                  type="text"
                  {...register("establishment", {
                    required: "*",
                    pattern: {
                      value: /^[0-9]{4}$/, // Regex for exactly 4 digits
                      message: "Please enter exactly 4 digits.", // Error message if validation fails
                    }
                  })}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="Longitude" className="col-form-label">
                  15. Longitude(देशांतर )
                  {errors.Longitude && (
                    <span className="text-danger">
                      {errors.Longitude.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  name="Longitude"
                  autoComplete="off"
                  className={`form-control ${
                    errors.Longitude ? "border-danger" : ""
                  }`}
                  type="text"
                  {...register("Longitude", {
                    required: "*",
                  })}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="Latitude" className="col-form-label">
                  16. Latitude( अक्षांश )
                  {errors.Latitude && (
                    <span className="text-danger">
                      {errors.Latitude.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  name="Latitude"
                  autoComplete="off"
                  className={`form-control ${
                    errors.Latitude ? "border-danger" : ""
                  }`}
                  type="text"
                  {...register("Latitude", {
                    required: "*",
                  })}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="name_respondent17" className="col-form-label">
                  17. Name of Respondent(शिक्षक का नाम:)
                  {errors.name_respondent17 && (
                    <span className="text-danger">
                      {errors.name_respondent17.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  name="name_respondent17"
                  autoComplete="off"
                  className={`form-control ${
                    errors.name_respondent17 ? "border-danger" : ""
                  }`}
                  type="text"
                  {...register("name_respondent17", {
                    required: "*",
                  })}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="designation_respondent18"
                  className="col-form-label"
                >
                  18. Designation of Respondent (शिक्षक का पद)
                  {errors.designation_respondent18 && (
                    <span className="text-danger">
                      {errors.designation_respondent18.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.designation_respondent18 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="designation_respondent18"
                    {...register("designation_respondent18", {
                      required: "*",
                    })}
                    id="Head_Master/ Head Mistress"
                    value="head_principal"
                  />
                  <label className="form-check-label" htmlFor="Head_Master">
                    Head Master/ Head Mistress(प्रधानाचार्य/ प्रधानाध्यापिका)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.designation_respondent18 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="designation_respondent18"
                    {...register("designation_respondent18", {
                      required: "*",
                    })}
                    id="School_in_charge"
                    value="school_incharge"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="School_in_charge"
                  >
                    School In-charge(विद्यालय प्रभारी)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.designation_respondent18 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="designation_respondent18"
                    {...register("designation_respondent18", {
                      required: "*",
                    })}
                    id="Warden"
                    value="warden"
                  />
                  <label className="form-check-label" htmlFor="Warden">
                  Warden
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.designation_respondent18 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="designation_respondent18"
                    {...register("designation_respondent18", {
                      required: "*",
                    })}
                    id="respondent_designation"
                    value="others"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="respondent_designation"
                  >
                    Other staff of the school(विद्यालय का अन्य कर्मचारी)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="contact_respondent" className="col-form-label">
                  19. Contact Details of Respondent(शिक्षक के संपर्क विवरण)
                  {errors.contact_respondent && (
                    <span className="text-danger">
                      {errors.contact_respondent.message}
                    </span>
                  )}{" "}
                  {errors.contact_respondent_email && (
                    <span className="text-danger">
                      {errors.contact_respondent_email.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-2">
                <input
                  name="contact_respondent_mobile"
                  autoComplete="off"
                  className={`form-control ${
                    errors.contact_respondent_mobile ? "border-danger" : ""
                  }`}
                  placeholder="Mobile No"
                  maxLength={10}
                  type="text"
                  {...register("contact_respondent_mobile", {
                    required: "*",
                    pattern: {
                      value: /^[0-9]{10}$/, // Regex for exactly 4 digits
                      message: "Please enter exactly 10 digits.", // Error message if validation fails
                    }
                  })}
                />
              </div>
              <div className="col-md-2">
                <input
                  name="contact_respondent_email"
                  autoComplete="off"
                  className={`form-control ${
                    errors.contact_respondent_mobile ? "border-danger" : ""
                  }`}
                  placeholder="Email"
                  type="email"
                  {...register("contact_respondent_email", {
                    required: "*",
                  })}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="enrolled_boys_2024_25"
                  className="col-form-label"
                >
                  20. Number of Students enrolled (2024-25):(छात्रों की संख्या (2024-25):)
                  {errors.enrolled_boys_2024_25 && (
                    <span className="text-danger">
                      {errors.enrolled_boys_2024_25.message}
                    </span>
                  )}
                  {errors.enrolled_girls_2024_25 && (
                    <span className="text-danger">
                      {errors.enrolled_girls_2024_25.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-2">
                <input
                  name="enrolled_boys_2024_25"
                  autoComplete="off"
                  className={`form-control ${
                    errors.enrolled_boys_2024_25 ? "border-danger" : ""
                  }`}
                  type="text"
                  maxLength={3} placeholder="Enrolled Boys 2024-25"
                  {...register("enrolled_boys_2024_25", {
                    required: "*",pattern: {
                      value: /^[0-9]*$/, // Regex for exactly 4 digits
                      message: "Please enter max 3 digits.", // Error message if validation fails
                    }
                  })}
                />
              </div>
              <div className="col-md-2">
                <input
                  name="enrolled_girls_2024_25"
                  autoComplete="off"
                  className={`form-control ${
                    errors.enrolled_girls_2024_25 ? "border-danger" : ""
                  }`}
                  type="text" maxLength={3}
                  placeholder="Enrolled Girls 2024-25" 
                  {...register("enrolled_girls_2024_25", {
                    required: "*",pattern: {
                      value: /^[0-9]*$/, // Regex for exactly 4 digits
                      message: "Please enter max 3 digits.", // Error message if validation fails
                    }
                  })}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="disability_boys_2024_25"
                  className="col-form-label"
                >
                  21. Number of Children with disability (2024-25):(छात्रों की संख्या (2024-25):)
                  {errors.disability_boys_2024_25 && (
                    <span className="text-danger">
                      {errors.disability_boys_2024_25.message}
                    </span>
                  )}
                  {errors.disability_girls_2024_25 && (
                    <span className="text-danger">
                      {errors.disability_girls_2024_25.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-2">
                <input
                  name="disability_boys_2024_25"
                  autoComplete="off"
                  className={`form-control ${
                    errors.disability_boys_2024_25 ? "border-danger" : ""
                  }`}
                  type="text" maxLength={2}
                  placeholder="Disability Boys 2024-25"
                  {...register("disability_boys_2024_25", {
                    required: "*",pattern: {
                      value: /^[0-9]*$/, // Regex for exactly 4 digits
                      message: "Please enter max 3 digits.", // Error message if validation fails
                    }
                  })}
                />
              </div>
              <div className="col-md-2">
                <input
                  name="disability_girls_2024_25"
                  autoComplete="off"
                  className={`form-control ${
                    errors.disability_girls_2024_25 ? "border-danger" : ""
                  }`} maxLength={2}
                  type="text"
                  placeholder="Disability Girls 2024-25"
                  {...register("disability_girls_2024_25", {
                    required: "*",pattern: {
                      value: /^[0-9]*$/, // Regex for exactly 4 digits
                      message: "Please enter max 3 digits.", // Error message if validation fails
                    }
                  })}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="teacher_all_male_with_parttime2024_25"
                  className="col-form-label"
                >
                  22. Number of Teachers (including part time) in 2024-25(शिक्षकों की संख्या (पार्ट टाइम सहित) 2024-25 में:)
                  {errors.teacher_all_male_with_parttime2024_25 && (
                    <span className="text-danger">
                      {errors.teacher_all_male_with_parttime2024_25.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-2">
                <input
                  name="teacher_all_male_with_parttime2024_25"
                  autoComplete="off"
                  className={`form-control ${
                    errors.teacher_all_male_with_parttime2024_25
                      ? "border-danger"
                      : ""
                  }`}
                  placeholder="Male"
                  maxLength={2}
                  type="text"
                  {...register("teacher_all_male_with_parttime2024_25", {
                    required: "*",pattern: {
                      value: /^[0-9]*$/  
                    }
                  })}
                />
              </div>
              <div className="col-md-2">
                <input
                  name="teacher_all_female_with_parttime2024_25"
                  autoComplete="off"
                  className={`form-control ${
                    errors.teacher_all_female_with_parttime2024_25
                      ? "border-danger"
                      : ""
                  }`}
                  placeholder="Female"
                  maxLength={2}
                  type="text"
                  {...register("teacher_all_female_with_parttime2024_25", {
                    required: "*",pattern: {
                      value: /^[0-9]*$/  
                    }
                  })}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="staff_all_male_with_partime_24_25"
                  className="col-form-label"
                >
                  23. Number of Staff (including part time) in 2024-25(विद्यालय के कर्मचारियों की संख्या (पार्ट टाइम सहित) 2024-25 में:)
                  {errors.staff_all_male_with_partime_24_25 && (
                    <span className="text-danger">
                      {errors.staff_all_male_with_partime_24_25.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-2">
                <input
                  name="staff_all_male_with_partime_24_25"
                  autoComplete="off"
                  className={`form-control ${
                    errors.staff_all_male_with_partime_24_25
                      ? "border-danger"
                      : ""
                  }`}
                  type="text"
                  placeholder="Male"
                  maxLength={2}
                  {...register("staff_all_male_with_partime_24_25", {
                    required: "*",pattern: {
                      value: /^[0-9]*$/  
                    }
                  })}
                />
              </div>
              <div className="col-md-2">
                <input
                  name="staff_all_female_with_partime_24_25"
                  autoComplete="off"
                  className={`form-control ${
                    errors.staff_all_female_with_partime_24_25
                      ? "border-danger"
                      : ""
                  }`}
                  type="text"  placeholder="Female"
                  maxLength={2}
                  {...register("staff_all_female_with_partime_24_25", {
                    required: "*",pattern: {
                      value: /^[0-9]*$/  
                    }
                  })}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="avg_monthly_attendance_boys_2024_25"
                  className="col-form-label"
                >
                  24. Average monthly Attendance of students (Boys) in 2024-25(छात्रों की औसत मासिक उपस्थिति (लड़के) 2024-25 में:)
                  {errors.avg_monthly_attendance_boys_2024_25 && (
                    <span className="text-danger">
                      {errors.avg_monthly_attendance_boys_2024_25.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.avg_monthly_attendance_boys_2024_25 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="avg_monthly_attendance_boys_2024_25"
                    {...register("avg_monthly_attendance_boys_2024_25" )}
                    id="attendance90to100"
                    value="90%-100%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="attendance90to100"
                  >
                    90%-100%
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.avg_monthly_attendance_boys_2024_25 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="avg_monthly_attendance_boys_2024_25"
                    {...register("avg_monthly_attendance_boys_2024_25")}
                    id="attendance75to89"
                    value="75%-89%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="attendance75to89"
                  >
                    75%-89%
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.avg_monthly_attendance_boys_2024_25 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="avg_monthly_attendance_boys_2024_25"
                    {...register("avg_monthly_attendance_boys_2024_25")}
                    id="attendance51to74"
                    value="51%-74%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="attendance51to74"
                  >
                    51%-74%
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.avg_monthly_attendance_boys_2024_25 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="avg_monthly_attendance_boys_2024_25"
                    {...register("avg_monthly_attendance_boys_2024_25")}
                    id="attendance35to50"
                    value="35%-50%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="attendance35to50"
                  >
                    35%-50%
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.avg_monthly_attendance_boys_2024_25 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="avg_monthly_attendance_boys_2024_25"
                    {...register("avg_monthly_attendance_boys_2024_25")}
                    id="attendanceBelow35"
                    value="Below 35%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="attendanceBelow35"
                  >
                    Below 35%(35% से कम)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="avg_monthly_attendance_girls_2024_25"
                  className="col-form-label"
                >
                  25. Average monthly Attendance of students (Girls) in 2024-25(छात्रों की औसत मासिक उपस्थिति (लड़कियाँ) 2024-25 में:)
                  {errors.avg_monthly_attendance_girls_2024_25 && (
                    <span className="text-danger">
                      {errors.avg_monthly_attendance_girls_2024_25.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.avg_monthly_attendance_girls_2024_25 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="avg_monthly_attendance_girls_2024_25"
                    {...register("avg_monthly_attendance_girls_2024_25", {
                      required: "*",
                    })}
                    id="avg_monthly_attendance_girls_2024_25A"
                    value="90%-100%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="avg_monthly_attendance_girls_2024_25A"
                  >
                    90%-100%
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.avg_monthly_attendance_girls_2024_25 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="avg_monthly_attendance_girls_2024_25"
                    {...register("avg_monthly_attendance_girls_2024_25", {
                      required: "*",
                    })}
                    id="avg_monthly_attendance_girls_2024_25B"
                    value="75%-89%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="avg_monthly_attendance_girls_2024_25B"
                  >
                    75%-89%
                  </label>
                </div>

                <div className="form-check">
                  <input
                   className={`form-check-input ${
                    errors.avg_monthly_attendance_girls_2024_25 ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="avg_monthly_attendance_girls_2024_25"
                    {...register("avg_monthly_attendance_girls_2024_25", {
                      required: "*",
                    })}
                    id="avg_monthly_attendance_girls_2024_25C"
                    value="51%-74%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="avg_monthly_attendance_girls_2024_25C"
                  >
                    51%-74%
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.avg_monthly_attendance_girls_2024_25 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="avg_monthly_attendance_girls_2024_25"
                    {...register("avg_monthly_attendance_girls_2024_25", {
                      required: "*",
                    })}
                    id="avg_monthly_attendance_girls_2024_25D"
                    value="35%-50%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="avg_monthly_attendance_girls_2024_25D"
                  >
                    35%-50%
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.avg_monthly_attendance_girls_2024_25 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="avg_monthly_attendance_girls_2024_25"
                    {...register("avg_monthly_attendance_girls_2024_25", {
                      required: "*",
                    })}
                    id="avg_monthly_attendance_girls_2024_25E"
                    value="Below 35%"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="avg_monthly_attendance_girls_2024_25E"
                  >
                    Below 35%(35% से कम)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="girls_enrolled_upper_primary_above6class_q26"
                  className="col-form-label"
                >
                  26. Number of girls enrolled in the Upper Primary school(उच्च प्राथमिक विद्यालय (कक्षा 6 और ऊपर) में नामांकित लड़कियों की संख्या:)
                  (Class 6 and above)
                  {errors.girls_enrolled_upper_primary_above6class_q26 && (
                    <span className="text-danger">
                      {
                        errors.girls_enrolled_upper_primary_above6class_q26
                          .message
                      }
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.girls_enrolled_upper_primary_above6class_q26 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="girls_enrolled_upper_primary_above6class_q26"
                    {...register(
                      "girls_enrolled_upper_primary_above6class_q26"
                      , {
                        required: "*",
                      })}
                    id="girls_enrolled_upper_primary_above6class_q26A"
                    value="Not applicable"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="girls_enrolled_upper_primary_above6class_q26A"
                  >
                    Not applicable(लागू नहीं है)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.girls_enrolled_upper_primary_above6class_q26 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="girls_enrolled_upper_primary_above6class_q26"
                    {...register(
                      "girls_enrolled_upper_primary_above6class_q26"
                      , {
                        required: "*",
                      })}
                    id="girls_enrolled_upper_primary_above6class_q26B"
                    value="Less than 15"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="girls_enrolled_upper_primary_above6class_q26B"
                  >
                    Less than 15(15 से कम)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.girls_enrolled_upper_primary_above6class_q26 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="girls_enrolled_upper_primary_above6class_q26"
                    {...register(
                      "girls_enrolled_upper_primary_above6class_q26"
                      , {
                        required: "*",
                      })}
                    id="girls_enrolled_upper_primary_above6class_q26C"
                    value="15-30"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="girls_enrolled_upper_primary_above6class_q26C"
                  >
                    15-30
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.girls_enrolled_upper_primary_above6class_q26 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="girls_enrolled_upper_primary_above6class_q26"
                    {...register(
                      "girls_enrolled_upper_primary_above6class_q26"
                      , {
                        required: "*",
                      })}
                    id="girls_enrolled_upper_primary_above6class_q26D"
                    value="30-45"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="girls_enrolled_upper_primary_above6class_q26D"
                  >
                    30-45
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.girls_enrolled_upper_primary_above6class_q26 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="girls_enrolled_upper_primary_above6class_q26"
                    {...register(
                      "girls_enrolled_upper_primary_above6class_q26"
                      , {
                        required: "*",
                      })}
                    id="girls_enrolled_upper_primary_above6class_q26E"
                    value="More Than 45"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="girls_enrolled_upper_primary_above6class_q26E"
                  >
                    More Than 45(45 से अधिक)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="soaps_per_student_year_q27"
                  className="col-form-label"
                >
                  27. Number of soaps available to per student per year(प्रति छात्र प्रति वर्ष उपलब्ध साबुन की संख्या:)
                  {errors.soaps_per_student_year_q27 && (
                    <span className="text-danger">
                      {errors.soaps_per_student_year_q27.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.soaps_per_student_year_q27 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="soaps_per_student_year_q27"
                    {...register("soaps_per_student_year_q27", {
                      required: "*",
                    })}
                    id="soaps_per_student_year_q27A"
                    value="Less than 4"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="soaps_per_student_year_q27A"
                  >
                    Less than 4 soaps/yr(4 साबुन/वर्ष से कम)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.soaps_per_student_year_q27 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="soaps_per_student_year_q27"
                    {...register("soaps_per_student_year_q27", {
                      required: "*",
                    })}
                    id="soaps_per_student_year_q27B"
                    value="4 soaps/yr"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="soaps_per_student_year_q27B"
                  >
                    4 soaps/yr(4 साबुन/वर्ष)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.soaps_per_student_year_q27 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="soaps_per_student_year_q27"
                    {...register("soaps_per_student_year_q27", {
                      required: "*",
                    })}
                    id="soaps_per_student_year_q27C"
                    value="More than 4"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="soaps_per_student_year_q27C"
                  >
                    More than 4 soaps/yr(4 साबुन/वर्ष से अधिक)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="school_have_functioning_gardening_kit_q28"
                  className="col-form-label"
                >
                  28. Does the School have fully functioning Gardening Kit?(क्या विद्यालय में पूरी तरह से क्रियाशील बागवानी किट है?)
                  {errors.school_have_functioning_gardening_kit_q28 && (
                    <span className="text-danger">
                      {errors.school_have_functioning_gardening_kit_q28.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                   className={`form-check-input ${
                    errors.school_have_functioning_gardening_kit_q28 ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="school_have_functioning_gardening_kit_q28"
                    {...register(
                      "school_have_functioning_gardening_kit_q28"
                      , {
                        required: "*",
                      })}
                    id="school_have_functioning_gardening_kit_q28A"
                    value="Yes"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_have_functioning_gardening_kit_q28A"
                  >
                    Yes(हाँ) 
                  </label>
                </div>
                <div className="form-check">
                  <input
                   className={`form-check-input ${
                    errors.school_have_functioning_gardening_kit_q28 ? "border-danger" : ""
                  }`}
                    type="radio"
                    name="school_have_functioning_gardening_kit_q28"
                    {...register("school_have_functioning_gardening_kit_q28", {
                      required: "*",
                    })}
                    id="school_have_functioning_gardening_kit_q28B"
                    value="No"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_have_functioning_gardening_kit_q28B"
                  >
                    No(नहीं)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="school_have_functioning_sanitation_kit_q29"
                  className="col-form-label"
                >
                  29. Does the School have fully functioning Sanitation Kit?(क्या विद्यालय में पूरी तरह से क्रियाशील स्वच्छता किट है?)
                  {errors.school_have_functioning_sanitation_kit_q29 && (
                    <span className="text-danger">
                      {
                        errors.school_have_functioning_sanitation_kit_q29
                          .message
                      }
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.school_have_functioning_sanitation_kit_q29 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_have_functioning_sanitation_kit_q29"
                    {...register("school_have_functioning_sanitation_kit_q29" , {
                      required: "*",
                    })}
                    id="school_have_functioning_sanitation_kit_q29A"
                    value="Yes"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_have_functioning_sanitation_kit_q29A"
                  >
                    Yes(हाँ) 
                  </label>
                </div>
                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_have_functioning_sanitation_kit_q29 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_have_functioning_sanitation_kit_q29"
                    {...register("school_have_functioning_sanitation_kit_q29" , {
                      required: "*",
                    })}
                    id="school_have_functioning_sanitation_kit_q29B"
                    value="No"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_have_functioning_sanitation_kit_q29B"
                  >
                    No(नहीं)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="school_have_functioning_firstaid_kit_q29"
                  className="col-form-label"
                >
                  30. Does the School have fully functioning First Aid Kit?(क्या विद्यालय में पूरी तरह से क्रियाशील प्राथमिक चिकित्सा किट है?)
                  {errors.school_have_functioning_firstaid_kit_q29 && (
                    <span className="text-danger">
                      {errors.school_have_functioning_firstaid_kit_q29.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_have_functioning_firstaid_kit_q29 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_have_functioning_firstaid_kit_q29"
                    {...register("school_have_functioning_firstaid_kit_q29" , {
                      required: "*",
                    })}
                    id="school_have_functioning_firstaid_kit_q29A"
                    value="Yes"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_have_functioning_firstaid_kit_q29A"
                  >
                    Yes(हाँ) 
                  </label>
                </div>
                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.school_have_functioning_firstaid_kit_q29 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_have_functioning_firstaid_kit_q29"
                    {...register("school_have_functioning_firstaid_kit_q29" , {
                      required: "*",
                    })}
                    id="school_have_functioning_firstaid_kit_q29B"
                    value="No"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_have_functioning_firstaid_kit_q29B"
                  >
                    No(नहीं)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label htmlFor="CCTV_camera_q31" className="col-form-label">
                  31. Availability of CCTV Camera
                  {errors.CCTV_camera_q31 && (
                    <span className="text-danger">
                      {errors.CCTV_camera_q31.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                     className={`form-check-input ${
                      errors.CCTV_camera_q31 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="CCTV_camera_q31"
                    {...register("CCTV_camera_q31" , {
                      required: "*",
                    })}
                    id="CCTV_camera_q31"
                    value="Yes"
                  />
                  <label className="form-check-label" htmlFor="CCTV_camera_q31">
                    Yes(हाँ) 
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.CCTV_camera_q31 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="CCTV_camera_q31"
                    {...register("CCTV_camera_q31" , {
                      required: "*",
                    })}
                    id="CCTV_camera_q31B"
                    value="No"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="CCTV_camera_q31B"
                  >
                    No(नहीं)
                  </label>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="functional_Baal_Sansad_in_school_q32"
                  className="col-form-label"
                >
                  32. Whether school functional Baal Sansad in school?(क्या विद्यालय में क्रियाशील बाल संसद है?)
                  {errors.functional_Baal_Sansad_in_school_q32 && (
                    <span className="text-danger">
                      {errors.functional_Baal_Sansad_in_school_q32.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Baal_Sansad_in_school_q32 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="functional_Baal_Sansad_in_school_q32"
                    {...register("functional_Baal_Sansad_in_school_q32" , {
                      required: "*",
                    })}
                    id="functional_Baal_Sansad_in_school_q32A"
                    value="Yes" 
                  />
                  <label
                    className="form-check-label"
                    htmlFor="functional_Baal_Sansad_in_school_q32A"
                  >
                    Yes(हाँ) 
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Baal_Sansad_in_school_q32 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="functional_Baal_Sansad_in_school_q32"
                    {...register("functional_Baal_Sansad_in_school_q32" , {
                      required: "*",
                    })}
                    id="functional_Baal_Sansad_in_school_q32B"
                    value="No"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="functional_Baal_Sansad_in_school_q32B"
                  >
                    No(नहीं)
                  </label>
                </div>
              </div>
            </div>

            {functionalBaalSansad === "Yes" && (

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="members_in_Baal_Sansad_q33"
                  className="col-form-label"
                >
                  33. How many members in Baal Sansad?(बाल संसद में कितने सदस्य हैं?)
                  {errors.members_in_Baal_Sansad_q33 && (
                    <span className="text-danger">
                      {errors.members_in_Baal_Sansad_q33.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                className={`form-control ${
                  errors.members_in_Baal_Sansad_q33 ? "border-danger" : ""
                }`}
                   
                  type="number"
                  name="members_in_Baal_Sansad_q33"
                  {...register("members_in_Baal_Sansad_q33" , {
                    required: functionalBaalSansad === "Yes" ? "*" : false,
                    pattern: {
                      value: /^[0-9]*$/  
                    }
                  })}
                  maxLength={2}
                  id="members_in_Baal_Sansad_q33"
                />
              </div>
            </div>)
}
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="functional_Jal_sena_q34"
                  className="col-form-label"
                >
                  34. Whether school having functional Jal Sena?(क्या विद्यालय में क्रियाशील जल सेना है?)
                  {errors.functional_Jal_sena_q34 && (
                    <span className="text-danger">
                      {errors?.functional_Jal_sena_q34?.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="functional_Jal_sena_q34"
                    {...register("functional_Jal_sena_q34" , {
                      required: "*",
                    })}
                    id="functional_Jal_sena_q34A"
                    value="Yes"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="functional_Jal_sena_q34A"
                  >
                    Yes(हाँ) 
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="functional_Jal_sena_q34"
                    {...register("functional_Jal_sena_q34" , {
                      required: "*",
                    })}
                    id="functional_Jal_sena_q34B"
                    value="No"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="functional_Jal_sena_q34B"
                  >
                    No(नहीं)
                  </label>
                </div>
              </div>
            </div>
            {functionalJalSena === "Yes" && (
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="members_in_Jal_Sena_q35"
                  className="col-form-label"
                >
                  35. How many members in Jal Sena?(जल सेना में कितने सदस्य हैं?)
                  {errors.members_in_Jal_Sena_q35 && (
                    <span className="text-danger">
                      {errors.members_in_Jal_Sena_q35.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  className={`form-control ${
                    errors.members_in_Baal_Sansad_q33 ? "border-danger" : ""
                  }`}
                  type="number"
                  name="members_in_Jal_Sena_q35"
                  {...register("members_in_Jal_Sena_q35" , {
                    required: functionalJalSena === "Yes" ? "*" : false,
                    pattern: {
                      value: /^[0-9]*$/  
                    }
                  })}
                  maxLength={2}
                  id="members_in_Jal_Sena_q35"
                />
              </div>
            </div>)}
            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="school_having_ramp_for_disability_q36"
                  className="col-form-label"
                >
                  36. Does the school having ramp for children with disability
                  to access in classroom?( क्या विद्यालय में दिव्यांग बच्चों के लिए कक्षा में पहुँचने हेतु रैंप है?)
                  {errors.school_having_ramp_for_disability_q36 && (
                    <span className="text-danger">
                      {errors?.functional_Jal_sena_q34?.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_having_ramp_for_disability_q36"
                    {...register("school_having_ramp_for_disability_q36" , {
                      required: "*",
                    })}
                    id="school_having_ramp_for_disability_q36"
                    value="Yes"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_having_ramp_for_disability_q36"
                  >
                    Yes(हाँ) 
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="radio"
                    name="school_having_ramp_for_disability_q36"
                    {...register("school_having_ramp_for_disability_q36" , {
                      required: "*",
                    })}
                    id="school_having_ramp_for_disability_q36B"
                    value="No"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_having_ramp_for_disability_q36B"
                  >
                    No(नहीं)
                  </label>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="school_awards_svp_q37"
                  className="col-form-label"
                >
                  37. Has the school won awards at different level in SVP
                  2016-17, SVP 2017-18 and SVP 2021-22? If so, please specify
                  the level of awards and year(s). Multiple responses can be
                  opted as per appropriate:(क्या विद्यालय ने SVP 2016-17, SVP 2017-18 और SVP 2021-22 में पुरस्कार जीते हैं? यदि हाँ, तो कृपया पुरस्कारों के स्तर और वर्ष का उल्लेख करें। कई उत्तरों का चयन किया जा सकता है जैसा उचित हो:)
                  {errors.school_awards_svp_q37 && (
                    <span className="text-danger">
                      {errors.school_awards_svp_q37.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="checkbox"
                    name="school_awards_svp_q37"
                    {...register("school_awards_svp_q37" , {
                      required: "*",
                    })}
                    id="school_awards_svp_q37A"
                    value="District Level"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_awards_svp_q37A"
                  >
                    District Level(जिला स्तर)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="checkbox"
                    name="school_awards_svp_q37"
                    {...register("school_awards_svp_q37" , {
                      required: "*",
                    })}
                    id="school_awards_svp_q37B"
                    value="State Level"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_awards_svp_q37B"
                  >
                    State Level(राज्य स्तर)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="checkbox"
                    name="school_awards_svp_q37"
                    {...register("school_awards_svp_q37" , {
                      required: "*",
                    })}
                    id="school_awards_svp_q37C"
                    value="National Level"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_awards_svp_q37C"
                  >
                    National Level(राष्ट्रीय स्तर)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="checkbox"
                    name="school_awards_svp_q37"
                    {...register("school_awards_svp_q37" , {
                      required: "*",
                    })}
                    id="school_awards_svp_q37D"
                    value="None"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_awards_svp_q37D"
                  >
                    None( कोई नहीं)
                  </label>
                </div>
              </div>
            </div>
            {(schoolSVPAwards && !schoolSVPAwards.includes("None")) && ( <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="school_awards_Year_svp_q38"
                  className="col-form-label"
                >
                  38. If yes then which year ..........(Mention year)(यदि हाँ, तो कौन सा वर्ष .......... (वर्ष का उल्लेख करें))
                  {errors.school_awards_Year_svp_q38 && (
                    <span className="text-danger">
                      {errors.school_awards_Year_svp_q38.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                className={`form-control ${
                  errors.school_awards_Year_svp_q38 ? "border-danger" : ""
                }`}
                maxLength={4}
                  type="number"
                  name="school_awards_Year_svp_q38" 
                  {...register("school_awards_Year_svp_q38" , {
                    required: (schoolSVPAwards && !schoolSVPAwards.includes("None")) ? "*" : false, 
                    pattern: {
                      value: /^[0-9]*$/  
                    }
                  })}
                  id="school_awards_Year_svp_q38"
                />
              </div>
            </div> )}

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="school_awards_msvp_q39"
                  className="col-form-label"
                >
                  39. Has the school won any awards in MSVP 2019-20?(क्या विद्यालय ने MSVP 2019-20 में कोई पुरस्कार जीते हैं?)
                  {errors.school_awards_msvp_q39 && (
                    <span className="text-danger">
                      {errors.school_awards_svp_q37.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="checkbox"
                    name="school_awards_msvp_q39"
                    {...register("school_awards_msvp_q39")}
                    id="school_awards_msvp_q39A"
                    value="District Level"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_awards_msvp_q39A"
                  >
                    District Level(जिला स्तर)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="checkbox"
                    name="school_awards_msvp_q39"
                    {...register("school_awards_msvp_q39")}
                    id="school_awards_msvp_q39B"
                    value="State Level"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_awards_msvp_q39B"
                  >
                    State Level(राज्य स्तर)
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className={`form-check-input ${
                      errors.functional_Jal_sena_q34 ? "border-danger" : ""
                    }`}
                    type="checkbox"
                    name="school_awards_msvp_q39"
                    {...register("school_awards_msvp_q39")}
                    id="school_awards_msvp_q39C"
                    value="None"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="school_awards_msvp_q39C"
                  >
                    None(कोई नहीं)
                  </label>
                </div>
              </div>
            </div>

            {(schoolMSVPAwards && !schoolMSVPAwards.includes("None")) && (

            <div className="row mb-2">
              <div className="col-md-4 offset-md-2">
                <label
                  htmlFor="school_awards_Year_Msvp_q40"
                  className="col-form-label"
                >
                  40. If yes then which year ..........(Mention year)(यदि हाँ, तो कौन सा वर्ष .......... (वर्ष का उल्लेख करें))
                  {errors.school_awards_Year_Msvp_q40 && (
                    <span className="text-danger">
                      {errors.school_awards_Year_Msvp_q40.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="col-md-4">
                <input
                  className={`form-control ${
                    errors.functional_Jal_sena_q34 ? "border-danger" : ""
                  }`}
                  maxLength={4}
                  type="number"
                  name="school_awards_Year_Msvp_q40" 
                  {...register("school_awards_Year_Msvp_q40" , {
                    required: (schoolMSVPAwards && !schoolMSVPAwards.includes("None")) ? "*" : false, 
                    pattern: {
                      value: /^[0-9]*$/  
                    }
                  })}
                  id="attendance90to100"
                />
              </div>
            </div>
)}
            <div className="mt-2 mb-5 row">
              <div className="col-md-12 text-center">
               
                {(disbaleSaveBtn === false) && 
                <button
                  type="submit"
                  className="btn btn-primary form-controlx customBtnx"
                >
                  Save
                </button>
                }
              </div>
            </div>
          </form>
        </div>
      </div>
      <FooterWithoutLogin />
    </div>
  );
}




--------------------------------------------------
// import React, { useState } from "react";
// import questions from "./questions";
// import "./PrimaryInfo.css";


// const PrimaryInfo = () => {
//   const [answers, setAnswers] = useState({});

//   const handleChange = (questionId, value) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [questionId]: value,
//     }));
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     console.log("Form Submitted", answers);
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-md">
//       <h2 className="text-2xl font-bold mb-4">SECTION 1 – GENERAL INFORMATION</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         {questions.map((q) => (
//           <div key={q.id} className="border-b pb-2">
//             <label className="block font-medium">
//               {q.id}. {q.question}
//             </label>
//             {q.type === "text" ? (
//               <input
//                 type="text"
//                 value={answers[q.id] || ""}
//                 onChange={(e) => handleChange(q.id, e.target.value)}
//                 className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
//               />
//             ) : q.type === "radio" ? (
//               <div className="mt-1">
//                 {q.options.map((option, index) => (
//                   <label key={index} className="block">
//                     <input
//                       type="radio"
//                       name={q.id}
//                       value={option}
//                       checked={answers[q.id] === option}
//                       onChange={(e) => handleChange(q.id, e.target.value)}
//                       className="mr-2"
//                     />
//                     {option}
//                   </label>
//                 ))}
//               </div>
//             ) : null}
//           </div>
//         ))}
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-600"
//         >
//           Submit
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PrimaryInfo;
// --------------------------------------------------
