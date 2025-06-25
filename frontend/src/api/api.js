// //api.js

// // In your api.js (ensure token is being properly included)
// export const uploadImage = async (file) => {
//   // Get token from storage (localStorage example)
//   const token = localStorage.getItem('authToken'); // Verify storage key matches your auth system
  
//   if (!token) {
//     throw new Error('No token found. Please log in again.');
//   }

//   const formData = new FormData();
//   formData.append('image', file);

//   try {
//     const response = await fetch('/api/upload', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}` // Ensure proper auth header format
//       },
//       body: formData
//     });

//     if (!response.ok) throw new Error('Upload failed');
//     return response.json();
//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error;
//   }
// };

import axios from "axios";

const API_URL = "http://localhost:8000/api/upload/upload";


export const uploadImage = async (formData) => {
  const token = localStorage.getItem("authToken"); // Get JWT token

if (!token) {
  console.error("No token found. Please log in again.");
  return;
}

  try {
    
    const response = await axios.post(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, //attach token
       },
      
    });
    console.log("Upload Response", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload failed", error);
    throw error;
  }
};
