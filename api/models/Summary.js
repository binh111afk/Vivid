const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema(
  {
    username: { type: String, required: true, lowercase: true, trim: true },
    type: { type: String, enum: ["day", "week", "month"], required: true },
    dateString: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

summarySchema.index({ username: 1, type: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.models.Summary || mongoose.model("Summary", summarySchema);
