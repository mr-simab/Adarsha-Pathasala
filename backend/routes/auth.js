const router = require("express").Router();
const controller = require("../controllers/authController");
const asyncHandler = require("../middleware/asyncHandler");
const { requireUser } = require("../middleware/auth");

router.post("/login", asyncHandler(controller.login));
router.get("/me", requireUser, asyncHandler(controller.me));

module.exports = router;
