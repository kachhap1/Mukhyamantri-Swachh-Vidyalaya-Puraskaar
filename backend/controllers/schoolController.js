//schoolContoller.js
const SchoolModel = require('../models/schoolModel');
const activityLogger = require('../middlewares/activityLogger');

const schoolController = {
    //all school list
    getAllSchools: async (req, res) => {
        try {
            activityLogger(req,"Fetching all schools list");
            const schools = await SchoolModel.getAllSchools();
            res.status(200).json({
                success: true,
                message: 'All school records found',
                data: schools,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching schools',
                error: error.message,
            });
        }
    },
    
    //get school by Udise code
    getSchoolByUdiseCode:async (req,res)=>{
        try{
            activityLogger(req,"Fetching School Details By Udise Code");
            const udiseCode = req.params.udiseCode;
            const school = await SchoolModel.getSchoolByUdiseCode(udiseCode);
            if(school.length>0){
                res.status(200).json({
                    success:true,
                    message:'School record found!',
                    data:school[0],
                    status:200
                });
            }else{
                res.status(404).json({
                    success:false,
                    message:'School record not found!',
                    status: '404 : Cannot find the requested resource'
                });
            }
        }catch(error){
            res.status(500).json({
                success:false,
                message:'Error in fetching schol details.',
                error:error.message,
            });
        }
    },

    //add
    addSchool:async(req,res)=>{
        try{
            activityLogger(req,"Adding new School");
            const schoolData = req.body;
            if(!schoolData||Object.keys(schoolData).length===0){
                return res.status(400).json({
                    success:false,
                    message:'Request body is empty or invalid'
                });
            }
            if(!schoolData.Udise_Code||!schoolData.School_Name||!schoolData.District_Name){
                return res.status(400).json({
                    success:false,
                    message:'Missing required fields:Udise_Code, school_Name,District_Name',
                });
            }
            console.group('schoolData:',schoolData);
            const newSchoolId = await SchoolModel.addSchool(schoolData);

            res.status(201).json({
                success:true,
                message:'School added successfully',
                id:newSchoolId,
            });
        }catch(error){
            console.log('Error in addSchool',error);
            res.status(500).json({
                success:false,
                message:'Error in adding school',
                error:error.message,
            });
        }
    },


    //update

    //delete
    deleteSchool: async (req,res)=>{
        try{
            const udiseCode = req.params.udiseCode;
            const affectedRows = await SchoolModel.deleteSchool(udiseCode);
            if(affectedRows>0){
                res.status(200).json({
                    success: true,
                    message: 'School deleted successfully'
                });
            }else{
                res.status(404).json({
                    success:false,message:'School not found!',
                    status:'404 : Cannot find the requested resource'
                })
            }
        }catch(error){
            res.status(500).json({
                success:false,
                message:'Error in deleting school.',
                error: error.message,
            });
        }
    }

};

module.exports = schoolController;
