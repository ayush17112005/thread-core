import streamifier from "streamifier";
import cloudinary from "../configs/cloudinary.js";
const uploadToCloudinaryService = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export { uploadToCloudinaryService };
