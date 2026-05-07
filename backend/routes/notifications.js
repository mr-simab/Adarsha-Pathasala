const router = require("express").Router();
const controller = require("../controllers/notificationController");
const asyncHandler = require("../middleware/asyncHandler");
const { requireRole } = require("../middleware/auth");

router.get("/", asyncHandler(controller.listNotifications));
router.post("/", requireRole("admin"), asyncHandler(controller.sendNotification));

module.exports = router;
