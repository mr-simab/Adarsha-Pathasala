const router = require("express").Router();
const controller = require("../controllers/noteController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/", asyncHandler(controller.listNotes));
router.post("/", asyncHandler(controller.saveNote));

module.exports = router;
