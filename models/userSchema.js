const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    accountType: { type: String, default: "User" },
    role: { type: String, default: "" },
    image: { type: String },
    password: { type: String, select: true },
    provider: { type: String, default: "DHive" }, // This field indicates the authentication provider for the user (e.g., Google, Facebook). It is of type String and defaults to "Dhive".
    followers: [{ type: mongoose.Schema.ObjectId, ref: "Followers" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
