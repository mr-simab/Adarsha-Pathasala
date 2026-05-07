const router = require("express").Router();
const controller = require("../controllers/attendanceController");
const asyncHandler = require("../middleware/asyncHandler");

router.post("/", asyncHandler(controller.saveAttendance));

module.exports = router;
