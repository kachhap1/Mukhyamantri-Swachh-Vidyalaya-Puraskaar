const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const authenticateJWT = require('../middlewares/authenticateJWT');
const { uploadFile } = require("../controllers/uploadController");

// Upload Route
router.post("/upload",authenticateJWT,upload.array("files",11),uploadFile); //upload 11 files at a time

// router.post("/upload",authenticateJWT, upload.single("file"), uploadFile); //uploads single file


module.exports = router;
