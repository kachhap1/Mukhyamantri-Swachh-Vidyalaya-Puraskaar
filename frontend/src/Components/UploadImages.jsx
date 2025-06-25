//UploadImage.jsx
import React, { useState } from "react";
import { uploadImage } from "./api";
import "./UploadImage.css";

const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(""); //clear the msg when file is selected
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("Uploading file..."); //////

    try {
      const response = await uploadImage(formData);
      console.log("Response from API:", response); /////////
      setMessage(response.message);

      setFile(null); // Reset the fille input after upload
      document.getElementById("fileInput").value = "";
    } catch (error) {
       // Display backend error message if available
      setMessage(error.response?.data?.message || "Error uploading file!");
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Image</h2>
      <input type="file" onChange={handleFileChange} className="upload-input" />
      <button onClick={handleUpload} className="upload-button">
        Upload
      </button>

      {/* Image Preview */}
      {file && (
        <div className="image-preview">
          <p>Selected File</p>
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="preview-img"
          />
        </div>
      )}
      {message && (
        <p
          className={`upload-message ${
            message.includes("Error") ? "error" : ""
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default UploadImage;
