import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  deleteIntern,
  getAllInterns,
} from "../controllers/user.controller.js";
import {
  jwtVerification,
  verifyAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(jwtVerification, logoutUser);
router.route("/change-password").post(jwtVerification, changePassword);
router
  .route("/delete-intern/:internId")
  .delete(jwtVerification, verifyAdmin, deleteIntern);
router.route("/interns").get(jwtVerification, verifyAdmin, getAllInterns);

export default router;
