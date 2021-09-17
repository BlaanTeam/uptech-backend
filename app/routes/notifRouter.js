const router = require("express").Router();
const { protectRouter } = require("../utils/middlewares");
const notifController = require("../controllers/notifController");

// protect the router
protectRouter(router);
router.get("/", notifController.getNotifs);
router.delete("/:notifId", notifController.deleteNotif);
router.patch("/:notifId", notifController.readNotif);
module.exports = router;
