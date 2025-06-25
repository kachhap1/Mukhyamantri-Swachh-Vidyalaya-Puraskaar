//userController.js: Add controllers for user registration, login, and other user-related actions.
const pool = require("../config/db");
const UserModel = require("../models/userModel");
const activityLogger = require("../middlewares/activityLogger");

const userController = {
  updateProfile: async (req, res) => {
    try {
      const userUdise = req.user.Udise_Code; //get udise code fro autheticated user
      console.log("User Udise Code:", userUdise); // Log Udise Code
      if (!userUdise) {
        console.log("Error: Udise Code missing"); // Log missing Udise
        return res.status(400).json({
          success: false,
          message: "Udise Code is required to update profile",
        });
      }

      const { Mobile_No, Password } = req.body; // Extract Mobile_No and Password from request body

      // Validate required fields
      if (!Mobile_No || !Password) {
        console.log("Error: Missing fields"); // Log missing fields
        return res.status(400).json({
          success: false,
          message: "Missing required fields: Mobile No., Password",
        });
      }

      const encodedPassword = Buffer.from(Password).toString("base64"); //encode the password before storing

      //log the activity
      await activityLogger(req, "Update Profile");

      //update user profile
      const query = `UPDATE login SET Mobile_No=?,Password=? WHERE Udise_Code=?`;

      const values = [Mobile_No, encodedPassword, userUdise];

      console.log("Executing Query:", query, values); // Log the SQL query & values

      await pool.query(query, values); // Use the pool object to query the database

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating profile",
        error: error.message,
      });
    }
  },
  //get user by ID
  getUserByUdiseCode: async (req, res) => {
    try {
      activityLogger(req, "getting user by ID");
      const userUdise = req.params.userUdiseCode; // Get userId/UdiseCode from request parameters

      if (!userUdise) {
        return res.status(400).json({
          success: false,
          message: "Udise Code is required",
        });
      }

      // Fetch user details from the database
      const user = await UserModel.getUserByUdiseCode(userUdise);

      if (user) {
        // Decode password before sending response
        user.Password = Buffer.from(user.Password, "base64").toString("utf8");

        res.status(200).json({
          success: true,
          message: "User fetched successfully",
          user,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching user",
        error: error.message,
      });
    }
  },
};
module.exports = userController;

// ---------------------------------------------
// const pool = require('../config/db');
// const UserModel  = require('../models/userModel');
// const activityLogger = require('../middlewares/activityLogger');

// const userController = {
//     //register new user
//     register: async (req,res)=>{
//         try{
//             activityLogger(req,"register");
//             const userData = req.body;
//             // Validate required fields
//             if (!userData.Udise_Code && !userData.Mobile_No && !userData.Respondent_Name && !userData.Designation) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Missing required fields: Udise_Code, Mobile_No, Respondent_Name, Designation',
//                 });
//             }
//             //register the user and generate otp
//             const {insertId,otp} = await UserModel.registerUser(userData);
//             console.log(`OTP for registration: ${otp}`);
//             //console.log(`OTP for registration: ${otpGenerator()}`);
//             res.status(200).json({
//                 success: true,
//                 message: 'User registered. OTP sent.',
//                 userId:insertId,
//                 status:res.statusCode
//             });
//         }catch(error){
//             res.status(400).json({
//                 success:false,
//                 message:'Error registering user',
//                 error:error.message,
//             });
//         }
//     },

//     //verify OTP for registration
//     verifyOTP: async (req, res) => {
//         try {
//             activityLogger(req, "verifyOTP");
//             const { Udise_Code, otp } = req.body;

//             if (!Udise_Code || !otp) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Missing required fields: Udise_Code, OTP',
//                 });
//             }

//             const isVerified = await UserModel.verifyOTP(Udise_Code, otp);

//             if (isVerified) {
//                 res.status(200).json({
//                     success: true,
//                     message: 'OTP verified successfully',
//                 });
//             } else {
//                 res.status(400).json({
//                     success: false,
//                     message: 'Invalid OTP or OTP expired',
//                 });
//             }
//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 message: 'Error verifying OTP',
//                 error: error.message,
//             });
//         }
//     },
//     //login a user
//     login: async (req, res) => {
//         try {
//             activityLogger(req, "Login");
//             const { Udise_Code, password } = req.body;

//             // Validate required fields for login
//             if (!Udise_Code || !password) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Missing required fields: Udise_Code, Password',
//                 });
//             }
//             // Authenticate the user
//             const user = await UserModel.loginUser(Udise_Code,password);
//             if(user){
//                 const otp = await UserModel.generateLoginOtp(Udise_Code);
//                 if(otp){
//                     console.log(`OTP for login: ${otp}`);
//                     res.status(200).json({
//                         success:true,
//                         message:'OTP sent for login',
//                         user,
//                     });
//                 }else{
//                     res.status(500).json({
//                         success: false,
//                         message:'Failed to generate OTP',
//                     });
//                 }
//             }else{
//                 res.status(401).json({
//                     success:false,
//                     message:'Invalid credentials',
//                 });
//             }
//         }catch(error){
//             res.status(500).json({
//                 success:false,
//                 message:'Error logging in',
//                 error:error.message,
//             });
//         }
//     },
//     //verify OTP for login
//     verifyLoginOTP: async (req, res) => {
//         try {
//             activityLogger(req, 'verifyLoginOTP');
//             const { Udise_Code, otp } = req.body;
//             const isVerified = await UserModel.verifyLoginOTP(Udise_Code, otp);

//             if (isVerified) {
//                 res.status(202).json({
//                     success: true,
//                     message: 'OTP verified. Login Successful!',
//                 });
//             } else {
//                 res.status(401).json({
//                     success: false,
//                     message: 'Invalid OTP or OTP expired',
//                 });
//             }
//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 message: 'Error verifying OTP',
//                 error: error.message,
//             });
//         }
//     },

//     //logout
//     logout: async(req,res)=>{
//         try{
//             await activityLogger(req,"Logout");
//             res.status(200).json({
//                 success:true,
//                 message:'Logout successful',
//             });
//         }catch(error){
//             res.status(500).json({
//                 success:false,
//                 message:'Error logging out',
//                 error:error.message,
//             });
//         }
//     },
//     //update profile
//      updateProfile: async(req,res)=>{
//         try{
//             const userId = req.user.Udise_Code;//get udise code fro autheticated user
//             const updateData = req.body;

//             //validate required fields
//             if(!updateData.Mobile_No || !updateData.Password)
//             {
//                 return res.status(400).json({
//                     success:false,
//                     messsage:'Missing required fields: Mobile No. , Password',
//                 });
//             }
//             //log the activity
//             await activityLogger(req,"Update Profile");

//             //update user profile
//             const query=`UPDATE login SET Mobile_No=?,Password=? WHERE Udise_Code=?`;

//             const values = [updateData.Mobile_No,updateData.Password,userId];

//             await pool.query(query, values); // Use the pool object to query the database

//             res.status(200).json({
//                 success:true,
//                 message:'Profile updated successfully',
//             });
//         }catch(error){
//             res.status(500).json({
//                 success:false,
//                 message:'Error updating profile',
//                 error:error.message,
//             });
//         }
//      },
//      //get user by ID
//      getUserById: async (req, res) => {
//         try {
//             const userId = req.params.Udise_Code; // Get userId/UdiseCode from request parameters

//             if (!userId) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'User ID is required',
//                 });
//             }

//             // Fetch user details from the database
//             const user = await UserModel.getUserById(userId);

//             if (user) {
//                 res.status(200).json({
//                     success: true,
//                     message: 'User fetched successfully',
//                     user,
//                 });
//             } else {
//                 res.status(404).json({
//                     success: false,
//                     message: 'User not found',
//                 });
//             }
//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 message: 'Error fetching user',
//                 error: error.message,
//             });
//         }
//     },
// };

// module.exports =userController;
