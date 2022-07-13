const router = require("express").Router();
const uploadImageMiddleware = require("../middleware/uploadImageMiddleware");
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");

router.post('/uploadAvatar', uploadImageMiddleware, authMiddleware ,uploadController.uploadAvatar);

module.exports = router;