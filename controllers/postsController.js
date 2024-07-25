const postSchema = require("../models/postSchema");
const viewsSchema = require("../models/viewsSchema");
const userSchema = require("../models/userSchema");
const followersSchema = require("../models/followersSchema");
const commentSchema = require("../models/postCommentsSchema");
const postCommentsSchema = require("../models/postCommentsSchema");

const mongoose = require("mongoose");

const stats = async (req, res, next) => {
  try {
    const { query } = req.query;
    const { userId } = req.body.user;

    const numOfDays = Number(query) || 28;

    // Calculate the current and previous periods
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setDate(currentDate.getDate() - numOfDays);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - numOfDays);

    const previousEndDate = new Date(startDate);

    // Current period data
    const totalPosts = await postSchema
      .find({
        user: userId,
        createdAt: { $gte: startDate, $lte: currentDate },
      })
      .countDocuments();

    const totalViews = await viewsSchema
      .find({
        user: userId,
        createdAt: { $gte: startDate, $lte: currentDate },
      })
      .countDocuments();

    const totalWriters = await userSchema
      .find({
        accountType: "writer",
      })
      .countDocuments();

    const totalFollowers = await userSchema.findById(userId);

    // Previous period data
    const previousTotalPosts = await postSchema
      .find({
        user: userId,
        createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      })
      .countDocuments();

    const previousTotalViews = await viewsSchema
      .find({
        user: userId,
        createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      })
      .countDocuments();

    // Assuming the total number of writers doesn't change frequently
    const previousTotalWriters = totalWriters;

    const previousTotalFollowers = await followersSchema
      .find({
        writerId: userId,
        createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      })
      .countDocuments();

    const viewStats = await viewsSchema.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
          },
          Total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const followersStats = await followersSchema.aggregate([
      {
        $match: {
          writerId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
          },
          Total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const last5Followers = await userSchema.findById(userId).populate({
      path: "followers",
      options: { sort: { _id: -1 } },
      perDocumentLimit: 5,
      populate: {
        path: "followerId",
        select: "name email image accountType followers -password",
      },
    });

    const last5Posts = await postSchema
      .find({ user: userId })
      .limit(5)
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      totalPosts,
      previousTotalPosts,
      totalViews,
      viewStats,
      followersStats,
      previousTotalViews,
      totalWriters,
      previousTotalWriters,
      followers: totalFollowers.followers.length,
      previousTotalFollowers,
      last5Followers: last5Followers.followers,
      last5Posts,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    //pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const result = await userSchema.findById(userId).populate({
      path: "followers",
      options: { sort: { _id: -1 }, limit: limit, skip: skip },
      populate: {
        path: "followerId",
        select: "name email image accountType followers -password ",
      },
    });

    const totalFollowers = await userSchema.findById(userId);

    const numOfPages = Math.ceil(totalFollowers.followers.length / limit);

    res.status(200).json({
      data: result.followers,
      total: totalFollowers.followers.length,
      numOfPages,
      page,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const getPostContent = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    let queryResult = postSchema.find({ user: userId }).sort({
      _id: -1,
    });

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    //records count
    const totalPost = await postSchema.countDocuments({ user: userId });
    const numOfPage = Math.ceil(totalPost / limit);

    queryResult = queryResult.skip(skip).limit(limit);

    const posts = await queryResult;

    res.status(200).json({
      success: true,
      totalPost,
      data: posts,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const createPost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { description, img, title, slug, category } = req.body;

    if (!(description || img || title || category)) {
      return next(
        "All fields are required. Please enter a description, title, category and select image."
      );
    }

    const post = await postSchema.create({
      user: userId,
      description,
      img,
      title,
      slug,
      category,
    });

    res.status(200).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const commentPost = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const { userId } = req.body.user;
    const { id } = req.params;

    if (comment === null || !comment) {
      return res.status(404).json({ message: "Comment is required." });
    }

    const newComment = new commentSchema({ comment, user: userId, post: id });

    await newComment.save();

    //updating the post with the comments id
    const post = await postSchema.findById(id);

    post.comments.push(newComment._id);

    await postSchema.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.status(201).json({
      success: true,
      message: "Comment published successfully",
      newComment,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const post = await postSchema.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const { cat, writerId } = req.query;

    let query = { status: true };

    if (cat) {
      query.category = cat;
    } else if (writerId) {
      query.user = writerId;
    }

    let queryResult = postSchema
      .find(query)
      .populate({
        path: "user",
        select: "name image role -password ",
      })
      .sort({ _id: -1 });

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    //records count
    const totalPost = await postSchema.countDocuments(queryResult);

    const numOfPage = Math.ceil(totalPost / limit);

    queryResult = queryResult.skip(skip).limit(limit);

    const posts = await queryResult;

    res.status(200).json({
      success: true,
      totalPost,
      data: posts,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const postComments = await postCommentsSchema
      .find({ post: postId })
      .populate({
        path: "user",
        select: "name image ",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      data: postComments,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const getPopularContents = async (req, res, next) => {
  try {
    const posts = await postSchema.aggregate([
      {
        $match: {
          status: true,
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          img: 1,
          user: 1,
          views: { $size: "$views" },
          category: 1,
          createdAt: 1,
        },
      },

      {
        $lookup: {
          from: "users", // Name of the user collection
          localField: "user", // Field from the posts collection
          foreignField: "_id", // Field from the users collection
          as: "user", // Name for the joined information
        },
      },
      {
        $unwind: "$user", // Unwind the userInfo array
      },
      {
        $project: {
          title: 1,
          slug: 1,
          img: 1,
          category: 1,
          views: 1,
          createdAt: 1,
          "user.name": 1,
          "user.image": 1,
        },
      },
      {
        $sort: { views: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    const writers = await userSchema.aggregate([
      {
        $match: {
          accountType: { $ne: "User" },
        },
      },
      {
        $project: {
          name: 1,
          image: 1,
          followers: { $size: "$followers" },
        },
      },
      {
        $sort: { followers: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Successful",
      data: { posts, writers },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await postSchema.findById(postId).populate({
      path: "user",
      select: "name image -password ",
    });

    const newView = await viewsSchema.create({
      user: post?.user,
      post: postId,
    });

    post.views.push(newView?._id);

    await postSchema.findByIdAndUpdate(postId, post);

    res.status(200).json({
      success: true,
      message: "Successful",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    await postSchema.findOneAndDelete({ _id: id, user: userId });

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id, postId } = req.params;

    await commentSchema.findByIdAndDelete(id);

    //removing commetn id from post
    const result = await postSchema.updateOne(
      { _id: postId },
      { $pull: { comments: id } }
    );

    if (result.modifiedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Comment removed successfully" });
    } else {
      res.status(404).json({ message: "Post or comment not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { editComment } = req.body;

    console.log("Updating comment", { id, editComment });

    // Update the comment by its ID
    const updatedComment = await commentSchema.findByIdAndUpdate(
      id,
      { comment: editComment },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  commentPost,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
  getFollowers,
  getPopularContents,
  getPost,
  getPostContent,
  stats,
  updatePost,
  getComments,
  updateComment,
};
