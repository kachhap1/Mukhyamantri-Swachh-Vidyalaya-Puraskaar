//activityLogContoller
const ActivityLogModel = require('../models/activityLogModel');

const activityLogController = {
    getAllLogs: async (req, res) => {
        try {
            const logs = await ActivityLogModel.getAllLogs();
            res.status(200).json({
                success: true,
                message: 'All activity logs found',
                data: logs,
            });
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching activity logs',
                error: error.message,
            });
        }
    },

    //add a new log
    addLog: async (req, res) => {
        try {
            const logData = req.body;
            const newLogId = await ActivityLogModel.addLog(logData);
            res.status(201).json({
                success: true,
                message: 'Activity log added successfully',
                id: newLogId,
            });
        } catch (error) {
            console.error('Error in addLog:', error); 
            res.status(500).json({
                success: false,
                message: 'Error adding activity log',
                error: error.message,
            });
        }
    },
    //get log by Id
    getLogById: async(req,res)=>{
        try{
            const{id} = req.params; // Extract log ID from URL parameters
            const log = await ActivityLogModel.getLogById(id);
            if(!log){
                return res.status(404).json({
                    success: false,
                    message:'Log not found!',
                });
            }
            res.status(200).json({
                success: true,
                message:'Log found!',
                data:log,
            });
        }catch(error) {
            console.error('Error fetching log by ID:', error);
            res.status(500).json({
                success:false,
                message:'Error in fetching activity log',
                error: error.message,
            });
         }
    },

    //update Log by Id
    updateLog: async (req, res) => {
        try {
            const { id } = req.params; // Extract log ID from URL parameters
            const logData = req.body;

            const affectedRows = await ActivityLogModel.updateLog(id, logData);

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Activity log not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Activity log updated successfully',
            });
        } catch (error) {
            console.error('Error updating activity log:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating activity log',
                error: error.message,
            });
        }
    }
};

module.exports = activityLogController;

