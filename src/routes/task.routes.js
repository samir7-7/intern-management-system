import { Router } from "express";
import {
  createTask,
  getUserTasks,
  updateTaskStatus,
  deleteTask,
  getAllTasks,
} from "../controllers/task.controller.js";
import {
  jwtVerification,
  verifyAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(jwtVerification, verifyAdmin, getAllTasks)
  .post(jwtVerification, verifyAdmin, createTask);

//this is for interns to get their assigned task
router.route("/my-tasks").get(jwtVerification, getUserTasks);

router
  .route("/:taskId")
  .patch(jwtVerification, updateTaskStatus)
  .delete(jwtVerification, verifyAdmin, deleteTask);

export default router;
