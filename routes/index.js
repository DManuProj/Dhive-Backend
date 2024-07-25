const express = require("express");
const authRoute = require("./authRoute");
const userRoute = require("./userRoute");
const postRoute = require("./postRoute");

const router = express.Router();

router.use("/api/auth", authRoute);
router.use("/api/users", userRoute);
router.use("/api/posts", postRoute);

module.exports = router;
