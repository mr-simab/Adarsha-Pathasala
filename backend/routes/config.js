const router = require("express").Router();
const controller = require("../controllers/configController");

router.get("/", controller.getConfig);

module.exports = router;
