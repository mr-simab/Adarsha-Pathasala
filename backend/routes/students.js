const router = require("express").Router();
const controller = require("../controllers/studentController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/", asyncHandler(controller.listStudents));
router.post("/", asyncHandler(controller.createStudent));
router.delete("/:id", asyncHandler(controller.removeStudent));

module.exports = router;
