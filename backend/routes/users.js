const router = require("express").Router();
const controller = require("../controllers/userController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/teachers", asyncHandler(controller.listTeachers));
router.post("/teachers", asyncHandler(controller.createTeacher));
router.delete("/teachers/:id", asyncHandler(controller.removeTeacher));

module.exports = router;
