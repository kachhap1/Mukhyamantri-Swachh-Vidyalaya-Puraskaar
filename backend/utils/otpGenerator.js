// utils/otpGenerator.js
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000); // wiil generate 6-digit OTP
};

module.exports = generateOTP;

// OR

// exports.generateOTP = () => {
//     return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
// };
