const mongoose = require("mongoose");
const shortid = require("shortid");

const urlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    visitHistory: [{ timestamp: { type: Number } }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

// Pre-save middleware to automatically generate shortId
urlSchema.pre('save', function(next) {
  if (!this.shortId) {
    this.shortId = shortid.generate(); // Generate a unique short ID if it's not set
  }
  next();
});

const URL = mongoose.model("url", urlSchema);

module.exports = URL;
