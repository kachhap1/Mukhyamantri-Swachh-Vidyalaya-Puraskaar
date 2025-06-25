import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import HeaderComponent from "../component/HeaderComponent";
import FooterWithoutLogin from "../component/FooterWithoutLogin";
import aboutBanner from "../images/aboutwash.png";
import AuthMenu from "../component/AuthMenu";
import Loader from "../component/Loader";
import { apiFormPost, apiJSONPost, parseJwtData } from "../api/utility";
import { useForm, Controller } from "react-hook-form";
import { showNotificationMsg } from "../api/common";
import { useNavigate } from "react-router-dom";
import AuthPermission from '../auth/AuthPermission';
export default function UploadImages() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");
  const [hideFinal,setHideFinal]= useState(false);
  const permission = AuthPermission(); 
  const [imagePreview1, setImagePreview1] = useState(null);
  const [imagePreview2, setImagePreview2] = useState(null);
  const [imagePreview3, setImagePreview3] = useState(null);
  const [imagePreview4, setImagePreview4] = useState(null);
  const [imagePreview5, setImagePreview5] = useState(null);
  const [imagePreview6, setImagePreview6] = useState(null);
  const [imagePreview7, setImagePreview7] = useState(null);
  const [imagePreview8, setImagePreview8] = useState(null);
  const [imagePreview9, setImagePreview9] = useState(null);
  const [imagePreview10, setImagePreview10] = useState(null);
  const [imagePreview11, setImagePreview11] = useState(null);
  const { token, allSurveyData, saveImages ,saveallData } = useAuth();
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
      if (parsedData?.images_info) {
        PreFillData(parsedData);
      }
      // if (allSurveyData) {
      //   if (
      //     JSON.parse(allSurveyData)?.images_info &&
      //     JSON.parse(allSurveyData)?.images_info !== undefined
      //   ) {
      //     PreFillData(allSurveyData);
      //   }
      // }
    }
    setShowLoader(false);
  }, [token,allSurveyData,permission]);

  const PreFillData = (allSurveyData) => {

    let primaryDatas = (allSurveyData)?.images_info;
    console.log(primaryDatas); 
    primaryDatas =  (typeof primaryDatas === 'string') ? JSON.parse(primaryDatas) : primaryDatas;

    // let  primaryDatas = JSON.parse(JSON.parse(allSurveyData)?.images_info);
    // if (primaryDatas && typeof primaryDatas === "object") {
    //   // return primaryDatas; // It's already an object, so return it as is.
    // } else {
    //   if (typeof primaryDatas === "string") {
    //     try {
    //       // Attempt to parse the string as JSON
    //       primaryDatas = JSON.parse(primaryDatas); 
    //       // If parsing is successful, return the parsed object
    //       //return primaryDatas;
    //     } catch (error) {
    //       // If an error occurs (invalid JSON), return the original string
    //       console.error("Invalid JSON string:", error);
    //       //return primaryDatas; // Returning the original string as it cannot be parsed
    //     }
    //   }
    // }

    console.log(primaryDatas);
    if (primaryDatas && Object.keys(primaryDatas).length) {
      Object.keys(primaryDatas).forEach((key) => {
        setValue(key, primaryDatas[key]); // Set value for the respective form field
        if (key === "schoolfrontview") {
          setImagePreview1(primaryDatas[key]); // Update the image preview state
        } else if (key === "cleanliness_schoolpremises") {
          setImagePreview2(primaryDatas[key]); // Update the image preview state
        } else if (key === "functional_toilets_boys") {
          setImagePreview3(primaryDatas[key]); // Update the image preview state
        } else if (key === "functional_toilets_girls") {
          setImagePreview4(primaryDatas[key]); // Update the image preview state
        } else if (key === "toilets_disabled_Children") {
          setImagePreview5(primaryDatas[key]); // Update the image preview state
        } else if (key === "garden") {
          setImagePreview6(primaryDatas[key]); // Update the image preview state
        } else if (key === "handwashing_soap") {
          setImagePreview8(primaryDatas[key]); // Update the image preview state
        } else if (key === "Water_quality_report") {
          setImagePreview9(primaryDatas[key]); // Update the image preview state
        } else if (key === "Rain_Water_Harvesting") {
          setImagePreview10(primaryDatas[key]); // Update the image preview state
        } else if (key === "Teacher_training_certificate") {
          setImagePreview11(primaryDatas[key]); // Update the image preview state
        } else if (key === "disposal_sanitary_waste") {
          setImagePreview7(primaryDatas[key]); // Update the image preview state
        }
      });
    }
  };

  const onSubmit = (data) => {
    setShowLoader(true);

    setShowLoader(false);
  };

  // Automatically upload the file when the input value changes
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const imageFor = event.target.getAttribute("data-imagefor");
    if (file) {
      setShowLoader(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filefor", imageFor);
        formData.append("udise_code", userinfos.udise_code);
        formData.append("columnname", "images_info");
        formData.append("mobile", userinfos.mobile);

        if (file) {
          // Create a FileReader instance
          const reader = new FileReader();

          // Set up the FileReader onload event to update the preview state
          reader.onloadend = () => {
            if (imageFor === "schoolfrontview") {
              setImagePreview1(reader.result); // Update the image preview state
            } else if (imageFor === "cleanliness_schoolpremises") {
              setImagePreview2(reader.result); // Update the image preview state
            } else if (imageFor === "functional_toilets_boys") {
              setImagePreview4(reader.result); // Update the image preview state
            } else if (imageFor === "functional_toilets_girls") {
              setImagePreview5(reader.result); // Update the image preview state
            } else if (imageFor === "toilets_disabled_Children") {
              setImagePreview6(reader.result); // Update the image preview state
            } else if (imageFor === "garden") {
              setImagePreview7(reader.result); // Update the image preview state
            } else if (imageFor === "handwashing_soap") {
              setImagePreview8(reader.result); // Update the image preview state
            } else if (imageFor === "Water_quality_report") {
              setImagePreview9(reader.result); // Update the image preview state
            } else if (imageFor === "Rain_Water_Harvesting") {
              setImagePreview10(reader.result); // Update the image preview state
            } else if (imageFor === "Teacher_training_certificate") {
              setImagePreview11(reader.result); // Update the image preview state
            }
          };

          // Read the file as a Data URL (base64)
          reader.readAsDataURL(file);
        }
        // Send the file to the server (PHP backend in this case)
        const response = await apiFormPost("saveImage.php", formData);

        if (
          response?.data?.statuscode === 200 &&
          response?.data?.title === "Success"
        ) {
          saveImages(response?.data?.imageurl);
          showNotificationMsg("success", response?.data?.message, {
            autoClose: 3000,
          });
          const updateImageJson = JSON.parse(response?.data?.imageurl);

          if (imageFor === "schoolfrontview") {
            setImagePreview1(updateImageJson?.schoolfrontview); // Update the image preview state
          } else if (imageFor === "cleanliness_schoolpremises") {
            setImagePreview2(updateImageJson?.cleanliness_schoolpremises); // Update the image preview state
          } else if (imageFor === "functional_toilets_boys") {
            setImagePreview4(updateImageJson?.functional_toilets_boys); // Update the image preview state
          } else if (imageFor === "functional_toilets_girls") {
            setImagePreview5(updateImageJson?.functional_toilets_girls); // Update the image preview state
          } else if (imageFor === "toilets_disabled_Children") {
            setImagePreview6(updateImageJson?.toilets_disabled_Children); // Update the image preview state
          } else if (imageFor === "garden") {
            setImagePreview7(updateImageJson?.garden); // Update the image preview state
          } else if (imageFor === "handwashing_soap") {
            setImagePreview8(updateImageJson?.handwashing_soap); // Update the image preview state
          } else if (imageFor === "Water_quality_report") {
            setImagePreview9(updateImageJson?.Water_quality_report); // Update the image preview state
          } else if (imageFor === "Rain_Water_Harvesting") {
            setImagePreview10(updateImageJson?.Rain_Water_Harvesting); // Update the image preview state
          } else if (imageFor === "Teacher_training_certificate") {
            setImagePreview11(updateImageJson?.Teacher_training_certificate); // Update the image preview state
          }
        } else {
          showNotificationMsg("error", response?.data?.message, {
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error:", error);
        showNotificationMsg("error", error?.response?.data?.message, {
          autoClose: 3000,
        });
      } finally {
        setShowLoader(false);
      }
    }
  };

  return (
    <div className="wrapper">
      {showLoader && <Loader />}
      <HeaderComponent />
      <AuthMenu pageName="uploadImage_info" />
      <p className="text-center"></p>
      <div className="mt-3 mb-3 pb-5 my-5 my-lg-4x innerBg">
        <div className="container">
          <form
            className={`rowx g-3 needs-validation `}
            autoComplete="off"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
          >
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                <label>(a) Front view of the school and premises </label>{" "}
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("schoolfrontview", { required: true })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="schoolfrontview"
                />
                {errors.schoolfrontview && <p>This field is required</p>}
              </div>
              <div className="col-md-2">
                {imagePreview1 && (
                  <img
                    src={imagePreview1}
                    alt="image1"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                    style={{ Width: "150px", Height: "90px" }}
                  />
                )}
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                <label>
                  (b) School yard, showing overall cleanliness of the school
                  premises{" "}
                </label>{" "}
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("cleanliness_schoolpremises", {
                    required: true,
                  })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="cleanliness_schoolpremises"
                />
                {errors.cleanliness_schoolpremises && (
                  <p>This field is required</p>
                )}
              </div>
              <div className="col-md-2">
                {imagePreview2 && (
                  <img
                    src={imagePreview2}
                    alt="image2"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                    style={{ Width: "150px", Height: "90px" }}
                  />
                )}
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                <label>
                  (c) Separate functional toilets for boys and girls (2 photos){" "}
                </label>{" "}
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("functional_toilets_boys", { required: true })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="functional_toilets_boys"
                />
                {errors.functional_toilets_boys && (
                  <p>This field is required</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("functional_toilets_girls", { required: true })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="functional_toilets_girls"
                />
                {errors.functional_toilets_girls && (
                  <p>This field is required</p>
                )}
              </div>
              <div className="col-md-2">
                {imagePreview3 && (
                  <img
                    src={imagePreview3}
                    alt="image3"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                  />
                )}
                {imagePreview4 && (
                  <img
                    src={imagePreview4}
                    alt="image4"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                {" "}
                <label>
                  (d) Functional toilets for Children with Disability{" "}
                </label>{" "}
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("toilets_disabled_Children", { required: true })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="toilets_disabled_Children"
                />
                {errors.toilets_disabled_Children && (
                  <p>This field is required</p>
                )}
              </div>
              <div className="col-md-2">
                {imagePreview5 && (
                  <img
                    src={imagePreview5}
                    alt="image5"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                {" "}
                <label>
                  (e) Nutrition Garden/Plantation/Kitchen garden in the school{" "}
                </label>{" "}
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("garden", { required: true })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="garden"
                />
                {errors.garden && <p>This field is required</p>}
              </div>
              <div className="col-md-2">
                {imagePreview6 && (
                  <img
                    src={imagePreview6}
                    alt="image6"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                {" "}
                <label>
                  (f) Incinerator/ burial system for disposal of sanitary waste{" "}
                </label>{" "}
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("disposal_sanitary_waste", { required: true })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="disposal_sanitary_waste"
                />
                {errors.disposal_sanitary_waste && (
                  <p>This field is required</p>
                )}
              </div>
              <div className="col-md-2">
                {imagePreview7 && (
                  <img
                    src={imagePreview7}
                    alt="image7"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                {" "}
                <label>(g) Facilities for handwashing with soap </label>{" "}
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("handwashing_soap", { required: true })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="handwashing_soap"
                />
                {errors.handwashing_soap && <p>This field is required</p>}
              </div>
              <div className="col-md-2">
                {imagePreview8 && (
                  <img
                    src={imagePreview8}
                    alt="image8"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                {" "}
                <label>(h) Water quality test report </label>{" "}
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("Water_quality_report", { required: true })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="Water_quality_report"
                />
                {errors.Water_quality_report && <p>This field is required</p>}
              </div>
              <div className="col-md-2">
                {imagePreview9 && (
                  <img
                    src={imagePreview9}
                    alt="image9"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                {" "}
                <label>(i) Rain Water Harvesting </label>{" "}
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("Rain_Water_Harvesting", { required: true })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="Rain_Water_Harvesting"
                />
                {errors.Rain_Water_Harvesting && <p>This field is required</p>}
              </div>
              <div className="col-md-2">
                {imagePreview10 && (
                  <img
                    src={imagePreview10}
                    alt="image10"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 offset-md-1">
                {" "}
                <label>(j) Teacher training certificate/ document </label>{" "}
              </div>
              {hideFinal === false && <div className="col-md-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  {...register("Teacher_training_certificate", {
                    required: true,
                  })}
                  multiple={false}
                  onChange={handleFileChange}
                  data-imagefor="Teacher_training_certificate"
                />
                {errors.Teacher_training_certificate && (
                  <p>This field is required</p>
                )}
              </div> }
              <div className="col-md-2">
                {imagePreview11 && (
                  <img
                    src={imagePreview11}
                    alt="image11"
                    className="img-fluid userUploadedImages"
                    loading="lazy"
                  />
                )}
              </div>
            </div>

            <div className="mt-2 mb-5 row">
              <div className="col-md-12 text-center">
              {hideFinal === false &&   <button
                  type="submit"
                  className="btn btn-primary form-controlx customBtnx"
                >
                  Save
                </button>}
              </div>
            </div>
          </form>
        </div>
      </div>
      <FooterWithoutLogin />
    </div>
  );
}
