const mongoose = require("mongoose");
const { Schema } = mongoose;

const viewsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users" },
    post: { type: Schema.Types.ObjectId, ref: "Posts" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Views", viewsSchema);
