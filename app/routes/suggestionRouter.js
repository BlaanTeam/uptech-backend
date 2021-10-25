const router = require("express").Router();
const { protectRouter } = require("../utils/middlewares");
const suggestionController = require("../controllers/suggestionController");

// protect router
router.use(protectRouter);

router.get("/", suggestionController.getSuggestions);

module.exports = router;
