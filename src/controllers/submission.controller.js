import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.models.js";
import upload from "../middlewares/multer.middleware.js";
import uploadToCloudinary from "../utils/cloudinary.js";

const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { submissionLink } = req.body;

    if (!submissionLink) {
      return res
        .status(400)
        .json(new ApiError(400, "Submission link is required"));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};
