const express = require("express");
const userAuth = require("../middleware/authMiddleware");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/verify/:userId/:otp", userController.OTPVerification);
router.post("/resend-link/:userId", userController.resentOTP);

//user routes
router.post("/follower/:id", userAuth, userController.followWriter);
router.delete("/follower/:id", userAuth, userController.unfollowWriter);

router.put("/update-user", userAuth, userController.updateUser);
router.put("/reset-password", userController.resetPassword);

router.get("/get-user/:id", userController.getUser);

module.exports = router;
