//activityLogger.js: Modify the middleware to capture more details like user ID, activity type, and description.
const ActivityLogModel = require("../models/activityLogModel");

//The activityLogger middleware intercepts every request and extracts details like user_id, Udise_Code, and activity_type
const activityLogger = async (req, actionType, res, next) => {
  try {
    const user_id = req.body?.Udise_Code || null;
    const Udise_Code =
      req.body.Udise_Code ||
      req.body?.Udise_Code ||
      req.params?.Udise_Code ||
      req.user?.Udise_Code ||
      null;
    let activity_type = req.method; //request HTTP methos(get,post,put,delete)
    const activity_desc = actionType + "||" + JSON.stringify(req.body);
    //let activity_description = `${activity_type} request to ${req.originalUrl}`;
    const ip_address = req.ip;

    //Debugging: Log the values being passed
    // console.log('Activity Log Data:', {
    //     user_id,
    //     Udise_Code,
    //     activity_type,
    //     activity_desc,
    //     ip_address,
    // });

    //Log activity values being passed
    await ActivityLogModel.addLog({
      user_id,
      Udise_Code,
      activity_type,
      activity_desc,
      ip_address,
    });
    //next(); //Proceeding to next middleware or route handler
  } catch (error) {
    console.error("Error in logging activity:", error);
    //next(error);
  }
};
module.exports = activityLogger;
