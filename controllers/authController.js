const { compareString, createJWT, hashPassword } = require("../util");

const userSchema = require("../models/userSchema");

const sendVerificationEmail = require("../util/sendmail");

const userSignup = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      image,
      accountType,
      provider,
      role,
    } = req.body;

    //check if user mail is exists
    const isUserExist = await userSchema.findOne({ email });

    if (isUserExist) {
      return next("Email is already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await userSchema({
      name: firstName + " " + lastName,
      email,
      password: !provider ? hashedPassword : "",
      image,
      accountType,
      provider,
      role,
    });

    const token = createJWT(user._id);
    //create the register user with email and create the otp function
    try {
      await user.save();
      await sendVerificationEmail(user, res, token);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "email is not valid" });
  }
};

const googleSignup = async (req, res, next) => {
  try {
    const { name, email, image, emailVerified } = req.body;

    const isUserExist = await userSchema.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exits!",
      });
    }

    const user = await userSchema.create({
      name,
      email,
      image,
      provider: "Google",
      emailVerified,
    });

    user.password = undefined;

    const token = createJWT(user?._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return next("please provide the user credentials");
    }

    const user = await userSchema.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    //email verified
    if (!user?.emailVerified) {
      return next("Please verify your email address");
    }

    //google account login

    if (user.provider === "Google" && !password) {
      const token = createJWT(user?._id);

      res.status(200).json({
        success: true,
        message: "Account Login successfully",
        user,
        token,
      });
    } else {
      //compare password
      const isMatch = await compareString(password, user.password);

      if (!isMatch) {
        return next("Invalid email or password");
      }

      user.password = undefined;
      const token = createJWT(user?._id);

      res.status(201).json({
        success: true,
        message: "Account login successful",
        user,
        token,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { userSignup, googleSignup, login };
