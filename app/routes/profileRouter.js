const router = require("express").Router();
const profileController = require("../controllers/profileController");
const { protectRouter } = require("../utils/middlewares");

router.use(protectRouter);

router.get("/:userName", profileController.getUser);
router.patch("/", profileController.updateUser);

router.put("/following/:userName", profileController.followUser);
router.delete("/following/:userName", profileController.unFollowUser);

router.put("/blocks/:userName", profileController.blockUser);
router.delete("/blocks/:userName", profileController.unBlockUser);
router.put("/rejects/:userName", profileController.rejectUser);
router.delete("/rejects/:userName", profileController.unRejectUser);
router.put("/accepts/:userName", profileController.acceptUser);
router.get("/:userName/posts", profileController.getUserPosts);
router.get("/:userName/following", profileController.getUserFollowing);
router.get("/:userName/followers", profileController.getUserFollowers);
module.exports = router;
