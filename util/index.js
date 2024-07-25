const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const hashPassword = async (userValue) => {
  try {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(userValue, salt);

    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

//compare the password
const compareString = async (string, hashedString) => {
  try {
    const isMatch = await bcrypt.compare(string, hashedString);
    return isMatch;
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again!" });
  }
};

//GENERATE JSON WEB TOKEN

const createJWT = (id) => {
  return JWT.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h",
  });
};

//Generate OTP

const generateOTP = () => {
  const min = 100000; //min 6-digit nb
  const max = 999999; //max 6 digit

  let randomNumber;

  randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
};

module.exports = { hashPassword, compareString, createJWT, generateOTP };
