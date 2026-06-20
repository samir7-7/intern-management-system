import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    internId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    link: {
      type: String,
      trim: true,
    },
    document: String,
    review: String,
  },
  { timestamps: true },
);

export const Submission = mongoose.model("Submission", submissionSchema);
