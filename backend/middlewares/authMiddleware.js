//authMiddleware.js: Add middleware to authenticate users and attach user details to the request object
const UserModel = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization; //token is udise code
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    token = token.startsWith("Bearer ")? token.split(" ")[1]: token;

    // Fetch user by token ( token is the user ID)
    const user = await UserModel.getUserByUdiseCode(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    user.Password = Buffer.from(user.Password, "base64").toString("utf8"); // Decode stored password before attaching user object

    // Attach the user object to the request
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error authenticating user",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
