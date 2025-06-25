const jwt = require("jsonwebtoken");

const authenticateJWT = (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1];// Extract token from 'Bearer <token>'

    if(!token){
        return res.status(401).json({
            success: false, 
            message:"Access denied.No token provided.",
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach decoded user data to request
        next(); //proceed to file upload
    }catch(error){
        return res.status(400).json({
            success: false, 
            message: "Invalid or expired token.",
        });
    }
};

module.exports = authenticateJWT;