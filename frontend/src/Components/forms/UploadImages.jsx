import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
// import HeaderComponent from "../component/HeaderComponent";
// import FooterWithoutLogin from "../component/FooterWithoutLogin";
// import aboutBanner from "../images/aboutwash.png";
import "./UploadImages.css";
import AuthMenu from "../AuthMenu";
import Loader from "../Loader";
import { apiFormPost, apiJSONPost, parseJwtData } from "../../api/utility";
import { useForm, Controller } from "react-hook-form";
import { showNotificationMsg } from "../../api/common";
import { useNavigate } from "react-router-dom";
import {checkPermission} from '../../auth/AuthPermission';
export default function UploadImages() {
  const nav = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [userinfos, setuserinfos] = useState("");
  const [hideFinal,setHideFinal]= useState(false);
//   const permission = AuthPermission(); 
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
  const { token,user, allSurveyData, saveImages ,saveallData } = useAuth();
  const permission = checkPermission(user, "CAN_UPLOAD_IMAGES"); // replace with the actual permission string

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

  const onSubmit = async (data) => {
    setShowLoader(true);

    // setShowLoader(false);
    try{
        const formData = new FormData();
        for(let i=1;i<=11;i++)
        {
            const file = data[`images${i}`]?.[0];
            if(file){
                formData.append("files",file);
            }
        }

        const response = await apiFormPost("/upload",formData,token);
        showNotificationMsg("success","Images uploaded successfully");
    }catch(error){
        console.error("Upload error:",error);
        showNotificationMsg("error","Error uploading images");
    }finally{
        setShowLoader(false);
    }
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
        const response = await apiFormPost("/api/savw-image", formData);

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
    <div className="upload-container">
      {showLoader && <Loader />}
      {/* <HeaderComponent /> */}
      <AuthMenu pageName="uploadImage_info" />
      <p className="form-section-title">Photographs & Annexures</p>
      <div className="upload-form-container">
        
          <form
            className="upload-form"
            autoComplete="off"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
          >
            <div className="form-content" >
                  <div className="form-row">
                    <div className="form-label-group">
                      <label>(a) Front view of the school and premises </label>
                    </div>
                    <div className="form-input-group">
                      <input
                        type="file"
                        accept="image/*"
                        capture="camera"
                        {...register("schoolfrontview", { required: true })}
                        multiple={false}
                        onChange={handleFileChange}
                        data-imagefor="schoolfrontview"
                      />
                      {errors.schoolfrontview && <p className="error-text">This field is required</p>}
                    </div>
                    <div className="form-preview">
                      {imagePreview1 && (
                        <img
                          src={imagePreview1}
                          alt="image1"
                          className="upload-preview"
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-label-group">
                      <label>
                        (b) School yard, showing overall cleanliness of the school
                        premises
                      </label>
                    </div>
                    <div className="form-input-group">
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
                        <p className="error-text">This field is required</p>
                      )}
                    </div>
                    <div className="form-preview">
                      {imagePreview2 && (
                        <img
                          src={imagePreview2}
                          alt="image2"
                          className="upload-preview"
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-label-group">
                      <label>
                        (c) Separate functional toilets for boys and girls (2 photos)
                      </label>
                    </div>
                    <div className="form-input-group multi-upload">
                    <input
                        type="file"
                         accept="image/*"
                        capture="camera"
                        {...register("functional_toilets_boys", { required: true })}
                        onChange={handleFileChange}
                        data-imagefor="functional_toilets_boys"
                      />
                      {errors.functional_toilets_boys && (<p className="error-text">This field is required</p>)}
                      <input
                        type="file"
                         accept="image/*"
                        capture="camera"
                        {...register("functional_toilets_girls", { required: true })}
                        onChange={handleFileChange}
                        data-imagefor="functional_toilets_girls"
                      />
                      {errors.functional_toilets_girls && (
                        <p className="error-text">This field is required</p>
                      )}
                    </div>
                    <div className="form-preview multi-preview">
                    {imagePreview3 && <img src={imagePreview3} alt="toilet-boys" className="upload-preview" />}
                    {imagePreview4 && <img src={imagePreview4} alt="toilet-girls" className="upload-preview" />}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-label-group">
                      
                      <label>
                        (d) Functional toilets for Children with Disability
                      </label>
                    </div>
                    <div className="form-input-group">
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
                        <p className="error-text">This field is required</p>
                      )}
                    </div>
                    <div className="form-preview">
                      {imagePreview5 && (
                        <img
                          src={imagePreview5}
                          alt="image5"
                          className="upload-preview"
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-label-group">
                      
                      <label>
                        (e) Nutrition Garden/Plantation/Kitchen garden in the school
                      </label>
                    </div>
                    <div className="form-input-group">
                      <input
                        type="file"
                        accept="image/*"
                        capture="camera"
                        {...register("garden", { required: true })}
                        multiple={false}
                        onChange={handleFileChange}
                        data-imagefor="garden"
                      />
                      {errors.garden && <p className="error-text">This field is required</p>}
                    </div>
                    <div className="form-preview">
                      {imagePreview6 && (
                        <img
                          src={imagePreview6}
                          alt="image6"
                          className="upload-preview"
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-label-group">
                      
                      <label>
                        (f) Incinerator/ burial system for disposal of sanitary waste
                      </label>
                    </div>
                    <div className="form-input-group">
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
                        <p className="error-text">This field is required</p>
                      )}
                    </div>
                    <div className="form-preview">
                      {imagePreview7 && (
                        <img
                          src={imagePreview7}
                          alt="image7"
                          className="upload-preview"
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-label-group">
                      
                      <label>(g) Facilities for handwashing with soap </label>
                    </div>
                    <div className="form-input-group">
                      <input
                        type="file"
                        accept="image/*"
                        capture="camera"
                        {...register("handwashing_soap", { required: true })}
                        multiple={false}
                        onChange={handleFileChange}
                        data-imagefor="handwashing_soap"
                      />
                      {errors.handwashing_soap && <p className="error-text">This field is required</p>}
                    </div>
                    <div className="form-preview">
                      {imagePreview8 && (
                        <img
                          src={imagePreview8}
                          alt="image8"
                          className="upload-preview"
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-label-group">
                      
                      <label>(h) Water quality test report </label>
                    </div>
                    <div className="form-input-group">
                      <input
                        type="file"
                        accept="image/*"
                        capture="camera"
                        {...register("Water_quality_report", { required: true })}
                        multiple={false}
                        onChange={handleFileChange}
                        data-imagefor="Water_quality_report"
                      />
                      {errors.Water_quality_report && <p className="error-text">This field is required</p>}
                    </div>
                    <div className="form-preview">
                      {imagePreview9 && (
                        <img
                          src={imagePreview9}
                          alt="image9"
                          className="upload-preview"
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-label-group">
                      
                      <label>(i) Rain Water Harvesting </label>
                    </div>
                    <div className="form-input-group">
                      <input
                        type="file"
                        accept="image/*"
                        capture="camera"
                        {...register("Rain_Water_Harvesting", { required: true })}
                        multiple={false}
                        onChange={handleFileChange}
                        data-imagefor="Rain_Water_Harvesting"
                      />
                      {errors.Rain_Water_Harvesting && <p className="error-text">This field is required</p>}
                    </div>
                    <div className="form-preview">
                      {imagePreview10 && (
                        <img
                          src={imagePreview10}
                          alt="image10"
                          className="upload-preview"
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                      <div className="form-label-group">
                        <label>(j) Teacher training certificate/ document</label>
                      </div>
                      {!hideFinal && (
                        <div className="form-input-group">
                          <input
                            type="file"
                             accept="image/*"
                             capture="camera"
                            {...register("Teacher_training_certificate", { required: true })}
                            onChange={handleFileChange}
                            data-imagefor="Teacher_training_certificate"
                          />
                        </div>
                      )}
                      <div className="form-preview">
                        {imagePreview11 && <img src={imagePreview11} alt="certificate" className="upload-preview" />}
                      </div>
                    </div>


                  <div className="form-submit">
                    
                    {hideFinal === false &&   <button
                        type="submit"
                        className="primary-button"
                      >
                        Save
                      </button>}
                    
                  </div>
              </div>
          </form>
      </div>
    </div>
  );
}
