//userRoutes.js: Add routes for user registration, login, and other user-related actions.
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const activityLogger = require("../middlewares/activityLogger");
const authMiddleware = require("../middlewares/authMiddleware");

//protected routes where authentication is required
// router.post('/logout',authMiddleware,activityLogger,userController.logout);

router.put(
  "/update-profile",authMiddleware,activityLogger,userController.updateProfile
);

//for fetching a user by ID
router.get(
  "/users/:Udise_Code",authMiddleware,activityLogger,userController.getUserByUdiseCode
);

module.exports = router;
