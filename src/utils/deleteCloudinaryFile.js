import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./index.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractPublicId = (url) => {
  const parts = url.split("/");
  const fileName = parts[parts.length - 1];
  return fileName.split(".")[0]; // Removes the extension
};

const deleteFileFromCloudinary = async (publicUrl) => {
  try {
    if (!publicUrl) return null;

    // extract public id
    const publicId = extractPublicId(publicUrl);

    // delete file from cloudinary
    const file = await cloudinary.uploader.destroy(publicId);

    return file;
  } catch (error) {
    throw new ApiError(
      400,
      "error while deleting file from cloudinary in utility"
    );
  }
};

export { deleteFileFromCloudinary };
