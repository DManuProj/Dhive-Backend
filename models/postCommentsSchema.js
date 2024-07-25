const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users" },
    post: { type: Schema.Types.ObjectId, ref: "Posts" },
    comment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comments", commentSchema);
