// store file local to cloudinary server then delete from local if successfully transfer
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload file to cloudinary
    const file = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // auto, image, video, raw, raw_image, raw_video
    });

    fs.unlinkSync(localFilePath); // remove from local server synchronously
    return file;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove from local server synchronously
  }
};
export { uploadFileOnCloudinary };

/*
SAMPLE RESPONSE AFTER UPLOADING FILE:
uploading: sample.jpg
{
  "asset_id": "3515c6000a548515f1134043f9785c2f",
  "public_id": "gotjephlnz2jgiu20zni",
  "version": 1719307544,
  "version_id": "7d2cc533bee9ff39f7da7414b61fce7e",
  "signature": "d0b1009e3271a942836c25756ce3e04d205bf754",
  "width": 1920,
  "height": 1441,
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2024-06-25T09:25:44Z",
  "tags": [],
  "pages": 1,
  "bytes": 896838,
  "type": "upload",
  "etag": "2a2df1d2d2c3b675521e866599273083",
  "placeholder": false,
  "url": "http://res.cloudinary.com/cld-docs/image/upload/v1719307544/gotjephlnz2jgiu20zni.jpg",
  "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/v1719307544/gotjephlnz2jgiu20zni.jpg",
  "asset_folder": "",
  "display_name": "gotjephlnz2jgiu20zni",
  "image_metadata": {
    "JFIFVersion": "1.01",
    "ResolutionUnit": "None",
    "XResolution": "1",
    "YResolution": "1",
    "Colorspace": "RGB",
    "DPI": "0"
  },
  "illustration_score": 0.0,
  "semi_transparent": false,
  "grayscale": false,
  "original_filename": "sample",
  "eager": [
    {
      "transformation": "c_pad,h_300,w_400",
      "width": 400,
      "height": 300,
      "bytes": 26775,
      "format": "jpg",
      "url": "http://res.cloudinary.com/cld-docs/image/upload/c_pad,h_300,w_400/v1719307544/gotjephlnz2jgiu20zni.jpg",
      "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/c_pad,h_300,w_400/v1719307544/gotjephlnz2jgiu20zni.jpg"
    },
    {
      "transformation": "c_crop,g_north,h_200,w_260",
      "width": 260,
      "height": 200,
      "bytes": 8890,
      "format": "jpg",
      "url": "http://res.cloudinary.com/cld-docs/image/upload/c_crop,g_north,h_200,w_260/v1719307544/gotjephlnz2jgiu20zni.jpg",
      "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/c_crop,g_north,h_200,w_260/v1719307544/gotjephlnz2jgiu20zni.jpg"
    }
  ],
  "api_key": "614335564976464"
}

*/
