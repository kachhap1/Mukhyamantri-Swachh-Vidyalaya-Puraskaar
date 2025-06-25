//schoolRoutes.js
const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const activityLogger = require('../middlewares/activityLogger');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected routes (auth required)
// Fetch all schools
router.get('/', activityLogger,schoolController.getAllSchools);

//get school by Udise code
router.get('/:udiseCode',authMiddleware,schoolController.getSchoolByUdiseCode);

// Add a new school
router.post('/addSchool', activityLogger, schoolController.addSchool);

//delete school by Udise code
router.delete('/:udiseCode',activityLogger,schoolController.deleteSchool);

module.exports = router;

