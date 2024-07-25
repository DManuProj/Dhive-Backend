const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    followerId: { type: mongoose.Types.ObjectId, ref: "Users" },
    writerId: { type: mongoose.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Followers", commentSchema);
