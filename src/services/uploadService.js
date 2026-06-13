import streamifier from "streamifier";
import cloudinary from "../configs/cloudinary.js";
import { AppError } from "../utils/errors/AppError.js";

const uploadToCloudinaryService = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        return reject(new AppError("Error uploading image to Cloudinary", 502));
      }
      resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export { uploadToCloudinaryService };
