const router = require("express").Router();
const controller = require("../controllers/classController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/", asyncHandler(controller.listClasses));
router.post("/", asyncHandler(controller.createClass));
router.delete("/:id", asyncHandler(controller.removeClass));

module.exports = router;
