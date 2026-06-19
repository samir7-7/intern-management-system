import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken(userId);
    const refreshToken = user.generateRefreshToken(userId);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
};

const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  //checking if any of the required fields are missing
  if ([fullName, email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  //checking if the user already exists in the database
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(
      400,
      "User already exists with this email please try with another email",
    );
  }

  //now create a new user in the database
  const user = await User.create({
    fullName,
    email,
    password,
  });

  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }

  //if user is created successfully then send a success response to the client
  res.status(201).json(
    new ApiResponse(200, "User registered successfully", {
      createdUser: user,
    }),
  );
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  //checking if any of the required fields are missing
  if ([email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  //checking if the user exists in the database
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Invalid email");
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    throw new ApiError(400, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    //as we have the user object we can directly pass the user._id to generate tokens instead of passing userId as an argument to the function
    user._id,
  );

  const options = {
    httpOnly: true,
    //false during development cause true shows undefined to tokens in postman
    secure: false,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        accessToken,
        refreshToken,
        loggedInUser: user,
      }),
    );
};

const logoutUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
    const options = {
      httpOnly: true,
      secure: false,
    };
    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, "User logged out successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to logout user");
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if ([oldPassword, newPassword].some((field) => field.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    if (oldPassword === newPassword) {
      throw new ApiError(
        400,
        "New password cannot be the same as the old password",
      );
    }
    //I can directly use req.user._id here because the auth middleware will attach the user object to the request after verifying the access token.
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const validPassword = await user.comparePassword(oldPassword);
    if (!validPassword) {
      throw new ApiError(400, "Invalid old password");
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json(new ApiResponse(200, "Password changed successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to change password");
  }
};

export { registerUser, loginUser, changePassword };
