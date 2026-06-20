import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

const jwtVerification = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies.accessToken;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      throw new ApiError(404, "Unauthorized access");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized access");
  }
};

// this will verify if the user is admin or not. This will be used in the routes that are only accessed by admin.
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden: Admins only");
  }
  next();
};

export { jwtVerification, verifyAdmin };
