const VerificationSchema = require("../models/emailVerificationSchema");
const followersSchema = require("../models/followersSchema");
const userSchema = require("../models/userSchema");
const sendVerificationEmail = require("../util/sendmail");
const { compareString, createJWT, hashPassword } = require("../util/index");

const OTPVerification = async (req, res, next) => {
  try {
    const { userId, otp } = req.params;

    const result = await VerificationSchema.findOne({ userId });

    if (!result) {
      return res.status(404).json({ message: "The user is invalid" });
    }

    const { expiredAt, token } = result;

    //check if the token has expired
    if (expiredAt < Date.now()) {
      await VerificationSchema.findOneAndDelete({ userId });

      res.status(404).json({ message: "Verification code has expired" });
    } else {
      const isMatch = await compareString(otp, token);

      if (isMatch) {
        await Promise.all([
          userSchema.findOneAndUpdate({ _id: userId }, { emailVerified: true }),
          VerificationSchema.findOneAndDelete({ userId }),
        ]);

        const user = await userSchema.findOneAndUpdate(
          { _id: userId },
          { emailVerified: true }
        );

        res.status(200).json({
          success: true,
          user,
          message: "Email verified successfully",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Verification failed or OTP is invalid",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Something went wrong" });
  }
};

const resentOTP = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await VerificationSchema.findOneAndDelete({ userId });

    const user = await userSchema.findById(userId);

    user.password = undefined;

    const token = createJWT(user?._id);

    await sendVerificationEmail(user, res, token);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};

const followWriter = async (req, res, next) => {
  try {
    const followerId = req.body.user.userId;
    const { id } = req.params;

    const checks = await followersSchema.findOne({ followerId });

    if (checks) {
      return res.status(201).json({
        success: false,
        message: "You are already following this writer",
      });
    }
    const writer = await userSchema.findById(id);

    const newFollower = await followersSchema.create({
      followerId,
      writerId: id,
    });

    writer.followers.push(newFollower._id);

    await userSchema.findByIdAndUpdate(id, writer, { new: true });

    res.status(201).json({
      success: true,
      message: "You are now following this writer " + writer.name,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};
const unfollowWriter = async (req, res, next) => {
  try {
    const followerId = req.body.user.userId;
    const { id } = req.params;

    // Find the follower entry
    const followerEntry = await followersSchema.findOne({
      followerId,
      writerId: id,
    });

    if (!followerEntry) {
      return res.status(404).json({
        success: false,
        message: "You are not following this writer",
      });
    }

    // Find the writer
    const writer = await userSchema.findById(id);

    if (!writer) {
      return res.status(404).json({ message: "Writer not found" });
    }

    // Remove the follower entry
    await followersSchema.findByIdAndDelete(followerEntry._id);

    // Remove follower from the writer's followers list
    writer.followers = writer.followers.filter(
      (follower) => follower.toString() !== followerEntry._id.toString()
    );

    await userSchema.findByIdAndUpdate(id, writer, { new: true });

    res.status(200).json({
      success: true,
      message: "You have unfollowed this writer " + writer.name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, image, email } = req.body;

    if (!(firstName || lastName)) {
      return next("Please provide all required field");
    }

    const { userId } = req.body.user;

    const result = await userSchema.findOne({ _id: userId });

    const updateUser = {
      name: firstName + " " + lastName,
      image,
      _id: userId,
      email,
    };

    if (result && result.email !== email) {
      const isEmailExist = await userSchema.findOne({ email });

      if (isEmailExist) {
        return next("Email is already exists");
      } else {
        updateUser.emailVerified = false;
      }
    }

    const user = await userSchema.findByIdAndUpdate(userId, updateUser, {
      new: true,
    });

    const token = createJWT(user._id);

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!(email || password)) {
      return next("Please provide all required field");
    }

    const user = await userSchema.findOne({ email });

    if (!user) {
      return next("Email is not found");
    }

    const hashedPassword = await hashPassword(password);

    const updatedUser = await userSchema.findByIdAndUpdate(
      user._id,
      hashedPassword,
      {
        new: true,
      }
    );

    const token = createJWT(user._id);

    updatedUser.password = undefined;

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user: updatedUser,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};

const getWriter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userSchema.findById(id).populate({
      path: "followers",
      select: "followerId",
    });

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userSchema.findById(id);

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};

module.exports = {
  OTPVerification,
  followWriter,
  getWriter,
  resentOTP,
  updateUser,
  getUser,
  resetPassword,
  unfollowWriter,
};
