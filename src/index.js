import app from "./app.js";
import connectDB from "./db/index.js";
import { User } from "./models/user.models.js";

//this function will check if the admin user already exists in the database. If not, it will create a new admin user with the credentials provided in the .env file.
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (adminExists) {
      console.log("Admin already exists");
      return;
    }

    await User.create({
      fullName: process.env.ADMIN_FULL_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};

connectDB()
  .then(() => {
    seedAdmin(); // Seed the admin user after successful database connection
    app.on("error", (err) => {
      console.error("Error starting the server:", err);
      throw err;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  });
