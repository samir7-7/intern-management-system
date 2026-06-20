import { Router } from "express";
import { submitTask } from "../controllers/submission.controller.js";
import { jwtVerification } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/:taskId")
  .post(jwtVerification, upload.single("submission"), submitTask);

export default router;
