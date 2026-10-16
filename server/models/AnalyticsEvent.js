const mongoose = require("mongoose");

const AnalyticsEventSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["view", "click"],
      required: true,
    },
    linkUrl: {
      type: String,
      default: "",
      maxlength: 2048,
    },
    visitorHash: {
      type: String,
      required: true,
      minlength: 64,
      maxlength: 64,
    },
    windowBucket: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

AnalyticsEventSchema.index(
  { ownerId: 1, type: 1, linkUrl: 1, visitorHash: 1, windowBucket: 1 },
  { unique: true }
);

module.exports = mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
