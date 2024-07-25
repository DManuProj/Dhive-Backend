const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const Verification = require("../models/emailVerificationSchema");
const { generateOTP, hashPassword } = require("./index.js");
const Mailgen = require("mailgen");

dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD } = process.env;

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

// Configure Mailgen
let mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "DHive",
    link: "https://dhive.com",
  },
});

const sendVerificationEmail = async (user, res, token) => {
  const { _id, email, name } = user;
  const otp = generateOTP();

  user.password = undefined;

  // Email body
  const emailBody = {
    body: {
      name: name.split(" ")[0],
      intro: "Welcome to DHive! We're very excited to have you on board.",
      action: [
        {
          instructions: "To verify your email, please use the following OTP:",
          button: [
            {
              color: "#22BC66",
              text: `<span style="font-size: 32px;">${otp}</span>`,
            },
          ],
        },
      ],
      outro:
        "This OTP expires in 2 minutes. If you did not sign up for this account, please ignore this email.",
    },
  };

  // Generate the email content
  const emailContent = mailGenerator.generate(emailBody);

  //mail option

  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "DHive Email Verification",
    html: emailContent,
  };

  try {
    const hashedToken = await hashPassword(String(otp));

    const newVerifiedEmail = await Verification.create({
      userId: _id,
      token: hashedToken,
      createdAt: Date.now(),
      expiredAt: Date.now() + 120000,
    });

    if (newVerifiedEmail) {
      transporter
        .sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: true,
            message: "OTP has been sent to your email.",
            user,
            token,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: "Something went wrong" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};

module.exports = sendVerificationEmail;
