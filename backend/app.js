//app.js
const express = require("express");
const dotenv = require("dotenv");   //load environment variables at the top of your main app.js
const cors = require("cors");

const connection = require("./config/db");
const activityLogRoutes = require("./routes/activityLogRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const activityLogger = require("./middlewares/activityLogger");
const authMiddleware = require("./middlewares/authMiddleware");

dotenv.config();

const app = express();

app.use(express.json());

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, //allow cookies
    // methods: "GET,POST,PUT,DELETE,OPTIONS",
    // allowedHeaders: "Content-Type,Authorization",
  })
);
app.options("*", cors()); // Allow preflight requests globally

app.use(activityLogger); //appply activitylogger to all routes

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Public routes (no auth required)
app.get("/status", (req, res) => {
  connection
    .query("SELECT 1 as solution")
    .then(() =>
      res
        .status(200)
        .json({ success: true, message: "Database connection successful" })
    )
    .catch((err) =>
      res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err,
      })
    );
});

// Apply authMiddleware only to specific routes
app.use("/api/activity-log", authMiddleware, activityLogRoutes); // Protected route
app.use("/api/schools", activityLogger, schoolRoutes); // Protected route
app.use("/api/users", userRoutes); // Public routes (register, login)
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//-------------------------------------------------------------------
