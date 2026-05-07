const router = require("express").Router();
const controller = require("../controllers/bootstrapController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/", asyncHandler(controller.getBootstrap));

module.exports = router;
