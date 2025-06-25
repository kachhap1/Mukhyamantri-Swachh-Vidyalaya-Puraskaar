//SchoolModel.js
const pool = require('../config/db');
//const { addSchool } = require('../controllers/schoolController');

const SchoolModel = {
    getAllSchools: async () => {
        const [rows] = await pool.query('SELECT * FROM operational_school_list');
        return rows;
    },

    //get school by Udise code
    getSchoolByUdiseCode: async (Udise_Code)=>{
        const [rows] = await pool.query('SELECT * FROM operational_school_list WHERE Udise_Code = ?',[Udise_Code]);
        return rows;
    },

    //add new school
    addSchool: async(schoolData)=>{
        try{
            const query = 'INSERT INTO operational_school_list SET ?';
            const [result] = await pool.query(query,[schoolData]);
            return result.insertId;
        }catch(error){
            console.error('Error in addSchool:',error);
            throw error;
        }
    },

    //delete school by Udise Code
    deleteSchool: async (udiseCode)=>{
        const [result] = await pool.query('DELETE FROM operational_school_list WHERE Udise_Code = ?',[udiseCode]);
        return result.affectedRows;
    }
};

module.exports = SchoolModel;