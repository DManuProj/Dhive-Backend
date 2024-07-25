const express = require("express");
const userAuth = require("../middleware/authMiddleware");

const postController = require("../controllers/postsController");

const router = express.Router();

//writer routes
router.post("/admin-analytics", userAuth, postController.stats);
router.post("/admin-followers", userAuth, postController.getFollowers);
router.post("/admin-content", userAuth, postController.getPostContent);
router.post("/create-post", userAuth, postController.createPost);

//like & comments
router.post("/comment/:id", userAuth, postController.commentPost);
router.patch("/comment/:id/", userAuth, postController.updateComment);

//update post
router.patch("/update/:id", userAuth, postController.updatePost);

//get posts
router.get("/", postController.getAllPosts);
router.get("/popular", postController.getPopularContents);
router.get("/:postId", postController.getPost);
router.get("/comments/:postId", postController.getComments);

//delete routes
router.delete("/comment/:id/:postId", userAuth, postController.deleteComment);
router.delete("/:postId", userAuth, postController.deletePost);

module.exports = router;
