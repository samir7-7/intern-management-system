// import fs from "fs";
// import cloudinary from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// //currently not using cloudinary for file uploads because of last minute issues with file extensions. The code is left here for future reference when we can fix the issue and use cloudinary for file uploads.
// const uploadToCloudinary = async (filePath) => {
//   if (!filePath) return null;
//   try {
//     const result = await cloudinary.v2.uploader.upload(filePath, {
//       folder: "tasks",
//       resource_type: "auto",
//     });
//     console.log("Cloudinary upload successful:", result.url);
//     // Delete the file from local storage
//     fs.unlinkSync(filePath);
//     return result;
//   } catch (err) {
//     console.error("Error uploading to Cloudinary:", err);
//     fs.unlinkSync(filePath); // Ensure the file is deleted even if upload fails
//   }
// };

// export default uploadToCloudinary;
