//uploadModel.js
const db = require("../config/db");

const Upload = {
  saveFile: async (fileName, filePath) => {
    const query = "INSERT INTO uploads (filename, filepath) VALUES (?, ?)";

    try {
      const [result] = await db.query(query, [fileName, filePath]);  // ✅ Now works correctly
      console.log("File details saved to database:", result);
      return result;
    } catch (err) {
      console.error("Database Insertion Error:", err);
      throw err;
    }
  },
};

module.exports = Upload;
