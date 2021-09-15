const router = require("express").Router();
const { protectRouter } = require("../utils/middlewares");
const notificationController = require("../controllers/notificationController");

// protect the router
protectRouter(router);
router.get("/", notificationController.getNotifications);
router.delete("/:notificationId", notificationController.deleteNotification);
module.exports = router;
