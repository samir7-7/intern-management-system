import { Task } from "../models/task.models.js";
import { User } from "../models/user.models.js";
import { Submission } from "../models/submission.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTask = async (req, res) => {
  try {
    const { taskName, description, assignedTo, deadline } = req.body;
    if (
      [taskName, description, assignedTo, deadline].some(
        (field) => !field || field.trim() === "",
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const assignedToUser = await User.findById(assignedTo);
    if (!assignedToUser) {
      throw new ApiError(404, "Assigned user not found");
    }
    if (assignedToUser.role !== "user") {
      throw new ApiError(400, "Only interns can be assigned tasks");
    }
    const task = await Task.create({
      taskName,
      description,
      assignedTo,
      assignedBy: req.user._id,
      deadline,
    });
    res
      .status(201)
      .json(new ApiResponse(200, "Task created successfully", { task }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Internal Server Error");
  }
};

const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
    })
      .populate("assignedBy", "fullName email") //to get the name and email of the admin who assigned the task
      .sort({ createdAt: -1 }); //to sort the tasks by createdAt in descending order

    return res
      .status(200)
      .json(new ApiResponse(200, "Tasks fetched successfully", { tasks }));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json(new ApiError(400, "Status is required"));
    }
    //this extra validation just to make sure that other intern can't update the status of the task that is not assigned to them
    const task = await Task.findOne({
      _id: taskId,
      assignedTo: req.user._id,
    });

    if (!task) {
      return res
        .status(404)
        .json(new ApiError(404, "Task not found or not assigned to you"));
    }

    task.status = status;

    await task.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Task status updated successfully", { task }));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json(new ApiError(400, error.message));
    }

    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json(new ApiError(404, "Task not found"));
    }

    // Delete associated submission if it exists cause when the task is deleted the submission of that task should also be deleted.
    await Submission.findOneAndDelete({
      taskId: taskId,
    });

    await task.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, "Task deleted successfully", { task }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error While Deleting Task"));
  }
};

// this controller will be used by the admin to get all the tasks in the system
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "fullName")
      .populate("assignedBy", "fullName")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, "All tasks fetched successfully", { tasks }));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

export { createTask, getUserTasks, updateTaskStatus, deleteTask, getAllTasks };
