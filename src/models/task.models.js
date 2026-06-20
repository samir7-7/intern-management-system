import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: [true, "Task name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "submitted", "completed"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deadline: {
      type: Date,
      required: [true, "Task deadline is required"],
    },
    //Array of string that stores the path of the document that admin can attach as supporting document with the task. This document can be accessed by the user to complete the task.
    supportingDocuments: [
      {
        type: String,
        required: false,
      },
    ],
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);
