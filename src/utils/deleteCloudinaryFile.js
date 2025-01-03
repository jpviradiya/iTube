import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./index.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1].split("?")[0]; // Removes query params
    return fileName.split(".")[0]; // Removes file extension
  } catch (error) {
    throw new ApiError(500, "Invalid URL format for extracting public ID");
  }
};

const deleteFileFromCloudinary = async (publicUrl, resourceType) => {
  try {
    if (!publicUrl) return null;

    // extract public id
    const publicId = extractPublicId(publicUrl);

    // delete file from cloudinary
    const file = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return file;
  } catch (error) {
    throw error?.message;
  }
};

export { deleteFileFromCloudinary };
