import { Submission } from "../models/submission.models.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import uploadToCloudinary from "../utils/cloudinary.js";

const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { description = "", link = "" } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json(new ApiError(404, "Task not found"));
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "Task is not assigned to you"));
    }

    const existingSubmission = await Submission.findOne({
      taskId,
    });

    if (existingSubmission) {
      return res.status(400).json(new ApiError(400, "Task already submitted"));
    }

    let documentUrl = null;

    if (req.file?.path) {
      const uploaded = await uploadToCloudinary(req.file.path);

      documentUrl = uploaded.secure_url;
    }

    if (!link && !documentUrl) {
      return res
        .status(400)
        .json(new ApiError(400, "Provide either a link or a ZIP file"));
    }

    const submission = await Submission.create({
      taskId,
      internId: req.user._id,
      description,
      link,
      document: documentUrl,
    });

    task.status = "submitted";
    await task.save();

    return res
      .status(201)
      .json(
        new ApiResponse(201, "Task submitted successfully", { submission }),
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

const sendSubmissionReview = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { review } = req.body;

    if (!review) {
      return res.status(400).json(new ApiError(400, "Review is required"));
    }
    if (!submissionId) {
      return res
        .status(400)
        .json(new ApiError(400, "Submission ID is required"));
    }

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json(new ApiError(404, "Submission not found"));
    }
    submission.review = review;
    await submission.save();

    const task = await Task.findById(submission.taskId);

    if (!task) {
      return res
        .status(404)
        .json(new ApiError(404, "Associated task not found"));
    }

    task.status = "completed";
    await task.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Review submitted successfully", { submission }),
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};
export { submitTask, sendSubmissionReview };
