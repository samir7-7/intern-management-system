import { Router } from "express";
import {
  createTask,
  getUserTasks,
  updateTaskStatus,
  deleteTask,
} from "../controllers/task.controller.js";
import {
  jwtVerification,
  verifyAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(jwtVerification, getUserTasks)
  .post(jwtVerification, verifyAdmin, createTask);

router
  .route("/:taskId")
  .patch(jwtVerification, updateTaskStatus)
  .delete(jwtVerification, verifyAdmin, deleteTask);

export default router;
