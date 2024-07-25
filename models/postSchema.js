const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    img: { type: String },
    category: { type: String, required: true },
    views: [{ type: Schema.Types.ObjectId, ref: "Views" }],
    user: { type: Schema.Types.ObjectId, ref: "Users" },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Posts", postSchema);
