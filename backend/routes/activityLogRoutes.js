//activityRoutes.js
const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');

// Fetch all activity logs
router.get('/', activityLogController.getAllLogs);

// Add a new activity log
router.post('/addLog', activityLogController.addLog);

// Get log by ID
router.get('/:id', activityLogController.getLogById);

// Update activity logs by ID
router.put('/:id', activityLogController.updateLog);

module.exports = router;

// 
// const {getAllLogs , addLog} = require('../controllers/activityLogController');

// const router = express.Router();

// // Routes
// router.get('/allLogs', getAllLogs);
// router.post('/addLog',addLog);

// module.exports = router;