const router = require("express").Router();
const controller = require("../controllers/feeController");
const asyncHandler = require("../middleware/asyncHandler");
const { requireRole } = require("../middleware/auth");

router.patch("/paid", requireRole("admin"), asyncHandler(controller.markFeePaid));

module.exports = router;
