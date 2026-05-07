const router = require("express").Router();
const controller = require("../controllers/deviceTokenController");
const asyncHandler = require("../middleware/asyncHandler");

router.post("/", asyncHandler(controller.registerToken));

module.exports = router;
