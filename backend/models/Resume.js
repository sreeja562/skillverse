const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fileName: {
      type: String,
      required: true
    },

    extractedText: {
      type: String,
      default: ""
    },

    analysis: {
      score: {
        type: Number,
        default: 0
      },

      strengths: {
        type: [String],
        default: []
      },

      weaknesses: {
        type: [String],
        default: []
      },

      suggestions: {
        type: [String],
        default: []
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Resume", resumeSchema);