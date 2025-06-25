//activityLogModel.js

const pool = require('../config/db');

const ActivityLogModel = {
    getAllLogs: async () => {
        const [rows] = await pool.query('SELECT * FROM activity_log');
        return rows;
    },
    //add new activity log
    addLog: async({ user_id, Udise_Code, activity_type, activity_desc, ip_address }) =>{
        try{
            const query = `INSERT INTO activity_log (user_id, Udise_Code, activity_type, activity_description, ip_address) VALUES(?,?,?,?,?)`;
            const [result] = await pool.query(query,[
                user_id,
                Udise_Code,
                activity_type,
                activity_desc,
                ip_address,
            ]);
            return result.insertId;
        }catch(error){
            console.log('Error in adding:',error);
            throw error;
        }
    },
    
    // Get log by ID
    getLogById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM activity_log WHERE Id = ?', [id]);
        return rows[0]; // Return the first row (log) or null if not found
    },

    //Update log by ID
    updateLog: async(id, logData) =>{
        const [result] = await pool.query('UPDATE activity_log Set ? WHEREId = ?',[logData, id]);
        return result.affectedRows;
    }
};

module.exports = ActivityLogModel;
