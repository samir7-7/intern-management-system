import { Router } from "express";
import {
  submitTask,
  sendSubmissionReview,
  getAllSubmissions,
} from "../controllers/submission.controller.js";
import {
  jwtVerification,
  verifyAdmin,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(jwtVerification, verifyAdmin, getAllSubmissions);

router
  .route("/:taskId")
  .post(jwtVerification, upload.single("submission"), submitTask);

router
  .route("/review/:submissionId")
  .patch(jwtVerification, verifyAdmin, sendSubmissionReview);
export default router;
