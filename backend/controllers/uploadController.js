//uploadController.js
const multer = require('multer');
const path = require('path');
const db = require('../config/db'); 
const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync('uploads/')) {
    fs.mkdirSync('uploads/', { recursive: true });
}

const fileFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith("image/")){
        cb(null, true);
    }else{
        cb(new Error("Only image files are allowed."),false);
    }
};

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userFolder = `uploads/${req.user.Udise_Code}`;
        if(!fs.existsSync(userFolder))
        {
            fs.mkdirSync(userFolder,{recursive:true});
        }

        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage, limits: {fileSize:5*1024*1024}, fileFilter: fileFilter });

// File upload controller
exports.uploadFile = async (req, res) => {
    try {
        if (!req.user || !req.user.Udise_Code) {
            return res.status(401).json({ message: 'Unauthorized: User must be logged in' });
        }

        const udiseCode = req.user.Udise_Code;
        const userId = req?.user?.Login_ID ?? ""; // Assuming user object contains Login_ID
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const uploadedFilesInfo = []; // For sending in response

        for(const file of files){

            const filePath = file.path; // Use Multer's provided path
            // const filePath = `${file.destination}/${file.filename}`;
            const fileURL = `http://localhost:8000/${filePath.replace(/\\/g, '/')}`

            // Insert file details into the uploads table, including Udise_Code
            await db.query(
                'INSERT INTO uploads (filename, filepath, udise_code) VALUES (?, ?, ?)',
                [file.filename, file.path, udiseCode]
            );

            // Log the upload action in the activity_log table with Udise_Code
            await db.query(
                'INSERT INTO activity_log (user_id, udise_code, activity_type, activity_description, ip_address) VALUES (?, ?, ?, ?, ?)',
                [userId, udiseCode, 'Image Upload', `User with Udise_Code ${udiseCode} uploaded a file: ${file.filename}`, req.ip]
            );

            uploadedFilesInfo.push({filename:file.filename, fileURL});
        }
        res.status(200).json({ message: 'File uploaded successfully', filename: files.filename , fileURL, files:uploadedFilesInfo,});
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// File delete controller

exports.deleteFile = async(req,res)=>{
    try{
        if(!req.user||!req.user.Udise_Code){
            return res.status(400).json({message: 'Unauthorized : User must be logged in'});
        }

        const udiseCode = req.user.Udise_Code;
        const userId = req.user.Login_ID;
        const {filename} = req.body;

        if(!filename){
            return res.status(400).json({message:'Filename '})
        } 

        //check if file exists
         const [rows] = await db.query('SELECT filepath FROM uploads WHERE filename=? AND udise_code=?',[filename,udiseCode]);
         if(rows.length === 0)
         {
            return res.status(404).json({message:'File not found'});
         }
         const filePath = rows[0].filepath;

         //delete filr from file system
         if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
         }

         //delete record from database
         await db.query('DELETE FROM uploads WHERE filename=? AND udise_code=?',[filename,udiseCode]);

         //log th delete action
         await db.query('INSERT INTO activity_log(user_id,udise_code,activity_type,activity_description,ip_address) VALUES (?,?,?,?,?)',[userId,udiseCode,'File Deletion',`User with Udise_Code ${udiseCode} deleted file: ${filename}`, req.ip]);
        
         res.status(200).json({message:'File deleted successfully'});
    }catch(error){
        console.log('FIle deletion error',error);
        res.status(400).json({message:'Error'});
    }
};
