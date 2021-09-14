const router = require("express").Router();
const { protectRouter } = require("../utils/middlewares");
const notificationController = require("../controllers/notificationController");

// protect the router
protectRouter(router);
router.get("/", notificationController.getNotifications);
module.exports = router;
