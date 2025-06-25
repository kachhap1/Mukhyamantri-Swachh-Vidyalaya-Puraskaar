//authRoutes
const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const activityLogger = require("../middlewares/activityLogger");
const router = express.Router();

router.post("/register", activityLogger, authController.register);
router.post("/verify-otp", activityLogger, authController.verifyOTP);

router.post("/set-password", authController.setPassword); /////

router.post(
  "/login",activityLogger,authController.login
);

// router.post("/login", activityLogger, authController.login);
// router.post('/verify-login-otp',activityLogger,authController.verifyLoginOTP);

router.post("/logout", authMiddleware, activityLogger, authController.logout);

module.exports = router;
