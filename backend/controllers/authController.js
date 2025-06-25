//authController.js
const jwt = require('jsonwebtoken');
const UserModel = require("../models/userModel");
const activityLogger = require("../middlewares/activityLogger");



const authController = {
  //register new user
  register: async (req, res) => {
    try {
      activityLogger(req, "register");
      const userData = req.body;
      // Validate required fields
      if (
        !userData.Udise_Code &&
        !userData.Mobile_No &&
        !userData.Respondent_Name &&
        !userData.Designation
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: Udise_Code, Mobile_No, Respondent_Name, Designation",
        });
      }
      // Register the user and generate OTP
      const { success, message, insertId, otp } = await UserModel.registerUser(
        userData
      );

      if (!success) {
        return res.status(400).json({
          success: false,
          message: message, // Message will be 'Udise Code already exists'
          status: res.statusCode,
        });
      }
      console.log(`OTP for registration: ${otp}`); /////
      res.status(200).json({
        success: true,
        message: "User registered. OTP sent.",
        userId: insertId,
        // otp:otp,
        // status:res.statusCode
      });
    } catch (error) {
      // console.error('Error in register:', error);///
      res.status(400).json({
        success: false,
        message: "Error registering user",
        error: error.message,
      });
    }
  },

  //verify OTP for registration
  verifyOTP: async (req, res) => {
    try {
      activityLogger(req, "verifyOTP");
      const { Udise_Code, otp } = req.body;

      if (!Udise_Code || !otp) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: Udise_Code, OTP",
        });
      }

      const isVerified = await UserModel.verifyOTP(Udise_Code, otp);

      if (isVerified) {
        res.status(200).json({
          success: true,
          message: "OTP verified successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid OTP or OTP expired",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error verifying OTP",
        error: error.message,
      });
    }
  },
  //set password
  setPassword: async (req, res) => {
    try {
      activityLogger(req, "Create Password");
      const { Udise_Code, password } = req.body;

      if (!Udise_Code || !password) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: Udise_Code,password",
          status: 400,
        });
      }
      const result = await UserModel.setPassword(Udise_Code, password); //setting password in db
      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Password created successfully.You can now log in.",
          status: 200,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          status: 400,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error setting password",
        error: error.message,
      });
    }
  },
  //login a user
  login: async (req, res) => {
    try {
      const { Udise_Code, password } = req.body;

      // Validate required fields for login
      if (!Udise_Code || !password) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: Udise_Code, password",
        });
      }
      // Authenticate the user
      const user = await UserModel.loginUser(Udise_Code, password);
      // console.log("Received Request Body:", req.body);

      if (user?.success === true) {
        activityLogger(req, "Login");

        //Generate JWT Token
        const token = jwt.sign(
          { Udise_Code: user.user.Udise_Code, role: user.user.Role},
          process.env.JWT_SECRET,
          { expiresIn: "1h"} //token expires in 1 hour
        );


        res.status(200).json({
          success: true,
          message: user?.message,
          statusCode: 200,
          userData: user?.user,
          token,
        });
      } else {
        res.status(401).json({
          success: false,
          message: user?.message,
          statusCode: 401,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error logging in",
        error: error.message,
      });
    }
  },
  //verify OTP for login
  // verifyLoginOTP: async (req, res) => {
  //     try {
  //         activityLogger(req, 'verifyLoginOTP');
  //         const { Udise_Code, otp } = req.body;

  //         if (!Udise_Code || !otp) {
  //             console.log('Missing Udise_Code or OTP'); //---
  //             return res.status(400).json({
  //                 success: false,
  //                 message: 'Missing required fields: Udise_Code, OTP',
  //             });
  //         }

  //         const isVerified = await UserModel.verifyLoginOTP(Udise_Code, otp);

  //         if (isVerified) {
  //             res.status(200).json({
  //                 success: true,
  //                 message: 'OTP verified. Login Successful!',
  //             });
  //         } else {
  //             res.status(401).json({
  //                 success: false,
  //                 message: 'Invalid OTP or OTP expired',
  //             });
  //         }
  //     } catch (error) {
  //         // console.error('Error verifying login OTP:', error); //-----
  //         res.status(500).json({
  //             success: false,
  //             message: 'Error verifying OTP',
  //             error: error.message,
  //         });
  //     }
  // },

  //logout
  logout: async (req, res) => {
    try {
      activityLogger(req, "Logout");
      const { Udise_Code } = req.body;

      if (!Udise_Code) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: Udise_Code",
        });
      }

      const result = await UserModel.logoutUser(Udise_Code);
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          status: 200,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error logging out",
        error: error.message,
      });
    }
  },
};
module.exports = authController;
