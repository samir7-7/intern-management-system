import { Router } from "express";
import {
  submitTask,
  sendSubmissionReview,
} from "../controllers/submission.controller.js";
import {
  jwtVerification,
  verifyAdmin,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/:taskId")
  .post(jwtVerification, upload.single("submission"), submitTask);

router
  .route("/review/:taskId")
  .get(jwtVerification, verifyAdmin, sendSubmissionReview);
export default router;
