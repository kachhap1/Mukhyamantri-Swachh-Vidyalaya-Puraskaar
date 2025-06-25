//userModel.js
const { encodeBase64 } = require("bcryptjs");
const pool = require("../config/db");
const otpGenerator = require("../utils/otpGenerator");
// const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const algorithm = "aes-256-cbc"; //Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

// Decrypting text
function decrypt(text) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const UserModel = {
  // Register a new user & generate OTP
  registerUser: async (userData) => {
    const checkUdiseCodeQry = `SELECT * FROM login WHERE Udise_Code=?`;
    // console.log("Checking if Udise Code exists:", userData?.Udise_Code); // Log Udise Code check
    const val = [userData?.Udise_Code];

    const [res] = await pool.query(checkUdiseCodeQry, val);
    console.log("Existing User Check Result:", res); // Log query result
    if (res.length > 0) {
      return { success: false, message: "Udise Code already exists" };
    }

    //Generate OTP
    const otp = otpGenerator();
    console.log("Generated OTP:", otp); //  Log generated OTP

    const otpGeneratedAt = new Date();

    const query = `
            INSERT INTO login 
            (Udise_Code, Mobile_No,Respondent_Name,Designation,Otp,Otp_Generated_At) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    // userData.Udise_Code && !userData.Mobile_No && !userData.Respondent_Name &&!userData.Designation
    const values = [
      userData.Udise_Code,
      userData.Mobile_No,
      userData.Respondent_Name,
      userData.Designation,
      otp,
      otpGeneratedAt,
    ];
    console.log("Executing Query:", query, values); //  Log query & values

    const [result] = await pool.query(query, values);
    console.log("User registered successfully, Insert ID:", result.insertId); //  Log success
    return {
      success: true,
      insertId: result.insertId,
      otp: otp,
    }; // Return the ID of the newly registered user
  },
  verifyOTP: async (Udise_Code, otp) => {
    const query = "SELECT otp,Otp_Generated_At FROM login WHERE Udise_Code=?";
    const [rows] = await pool.query(query, [Udise_Code]);

    if (rows.length === 0) return false; // User not found

    const { otp: storedOtp, Otp_Generated_At } = rows[0];

    // Check if OTP matches and is not expired
    const now = new Date();
    const otpExpirationTime = new Date(Otp_Generated_At);
    otpExpirationTime.setMinutes(otpExpirationTime.getMinutes() + 15);

    if (storedOtp === otp && now <= otpExpirationTime) {
      const updateQuery = `UPDATE login SET Otp_Verified_At = NOW(), Otp = NULL, Otp_Generated_At = NULL WHERE Udise_Code=?`;
      await pool.query(updateQuery, [Udise_Code]);
      return true;
    }
    return false;
  },
  setPassword: async (Udise_Code, password) => {
    const hashedPass = Buffer.from(password, "utf8").toString("base64");

    const query = `UPDATE login SET Password=? WHERE Udise_Code=?`;
    const [result] = await pool.query(query, [hashedPass, Udise_Code]);

    if (result.affectedRows > 0) {
      return {
        success: true,
        message: "Password set successfully",
      };
    } else {
      return {
        success: false,
        message: "Failed to set password",
      };
    }
  },
  loginUser: async (Udise_Code, password) => {
    const hashedPass = Buffer.from(password, "utf8").toString("base64");
    const query = `
            SELECT Udise_Code,Mobile_No, Login_Status,Respondent_Name, Designation FROM login 
            WHERE Udise_Code = ? and Password =?
        `;
    const [rows] = await pool.query(query, [Udise_Code, hashedPass]);

    if (rows.length === 0) {
      // return null;
      return {
        success: false,
        message: "Invalid Credentials",
        statusCode: 401,
      };
    } else if (rows?.length === 1) {
      await pool.query(
        "UPDATE login SET Login_Status = 1 WHERE Udise_Code = ?",
        [Udise_Code]
      );
      let UpdatedResult = rows[0];
      UpdatedResult.Login_Status = 0;
      // UpdatedResult.myname = "ssfsdfsd";

      return {
        success: true,
        message: "Logged in successfully",
        user: UpdatedResult,
      };
    }

    //Check if password exists in the database
    // if (!user.Password) {
    //     return { success: false, message: 'Password not set. Please set your password first.', statusCode: 400 };
    // }

    //const user = rows[0];

    // If password is not set (null), set the password during the login process

    // if (!user.Password) {
    //     const updateQuery = `
    //         UPDATE login
    //         SET Password = ?
    //         WHERE Udise_Code = ?
    //     `;
    //     const [updateResult] = await pool.query(updateQuery, [password, Udise_Code]);

    //     if (updateResult.affectedRows > 0) {
    //         return { success: true, message: 'Password set successfully, you can now log in with the new password' ,user};
    //     } else {
    //         return { success: false, message: 'Failed to set password' };
    //     }
    // }

    // Check the password
    // if (user.Password === password) {
    //     return { success: true, message: 'Logged in successfully', user };
    // } else {
    //     return { success: false, message: 'Invalid password' };
    // }

    // const matchPassword = await bcrypt.compare(password,user.Password);
    // // const matchPassword = (password === user.Password);
    // if(!matchPassword){
    //     return {
    //         success:false,
    //         message:'Invalid credentials',
    //         statusCode: 401
    //     };
    // }
    //update login status

    // return {
    //     success: true,
    //     message: 'Logged in successfully',
    //     user: {
    //         Udise_Code: user.Udise_Code,
    //         Mobile_No: user.Mobile_No,
    //         Respondent_Name: user.Respondent_Name,
    //         Designation: user.Designation,
    //         Login_Status: 1 // Reflects the updated status
    //     }
    // };
  },

  // generateLoginOtp: async (Udise_Code) => {
  //     const otp = otpGenerator(); // Generate a new OTP
  //     const otpGeneratedAt = new Date(); // Timestamp for OTP generation

  //     const query = `
  //         UPDATE login
  //         SET Otp = ?, Otp_Generated_At = ?
  //         WHERE Udise_Code = ?
  //     `;

  //     const values = [otp, otpGeneratedAt, Udise_Code];

  //     const [result] = await pool.query(query, values);

  //     if (result.affectedRows > 0) {
  //         return otp; // Return the generated OTP if the update was successful
  //     } else {
  //         throw new Error('Failed to generate OTP for login');
  //     }
  // },

  //verify otp for login
  // verifyLoginOTP: async (Udise_Code, otp) => {
  //     console.log(`Checking OTP for Udise_Code: ${Udise_Code}, OTP: ${otp}`);//---------
  //     // First check if OTP exists and is valid
  //     const checkQuery = `
  //         SELECT Otp_Generated_At
  //         FROM login
  //         WHERE Udise_Code = ?
  //         AND Otp = ?
  //         AND Otp_Generated_At >= NOW() - INTERVAL 15 MINUTE
  //     `;
  //     const [checkRows] = await pool.query(checkQuery, [Udise_Code, otp]);

  //     if (checkRows.length === 0) {
  //         // console.log('No valid OTP found or OTP expired'); //-------
  //         return false;}
  //         console.log('OTP found and valid, updating login status'); //-----
  //     // Then update the verification status
  //     const updateQuery = `
  //         UPDATE login
  //         SET Otp_Verified_At = NOW(), Login_Status = 1
  //         WHERE Udise_Code = ?
  //     `;
  //     const [result] = await pool.query(updateQuery, [Udise_Code]);
  //     // console.log(`Rows affected: ${result.affectedRows}`); //-------
  //     return result.affectedRows > 0;
  // },

  // Fetch user by ID
  getUserByUdiseCode: async (Udise_Code) => {
    const query = `
            SELECT * FROM login 
            WHERE Udise_Code = ?
        `;
    const [rows] = await pool.query(query, [Udise_Code]);
    return rows[0]; // Return the user object if found, otherwise null
  },

  //logout
  logoutUser: async (Udise_Code) => {
    const query = `UPDATE login SET Login_Status =0 WHERE Udise_Code =?`;

    const [result] = await pool.query(query, [Udise_Code]);

    return result.affectedRows > 0
      ? { success: true, message: "Logged out successfully" }
      : { success: false, message: "Logout failed" };
  },
};

module.exports = UserModel;
