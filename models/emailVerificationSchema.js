const mongoose = require("mongoose");
const { Schema } = mongoose;

const emailVerifySchema = Schema({
  userId: { type: String },
  token: { type: String },
  createdAt: { type: Date },
  expiredAt: { type: Date },
});

module.exports = mongoose.model("Verification", emailVerifySchema);
