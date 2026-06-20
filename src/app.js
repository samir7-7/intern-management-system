import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "16kb",
  }),
);
app.use(cookieParser());
app.use(
  express.urlencoded({
    limit: "16kb",
    extended: true,
  }),
);
app.use(express.static("public"));

//importing routes
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import submitRoutes from "./routes/submission.routes.js";

//using routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/submit", submitRoutes);
export default app;
