import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    description: {
      type: String,
      required: false,
    },
    internId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    document: {
      type: [String],
      required: [true, "Submission document is required"],
    },
    review: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

export const Submission = mongoose.model("Submission", submissionSchema);
