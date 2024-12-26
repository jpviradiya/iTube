import multer from "multer";

const storage = multer.diskStorage({
  // file destination to store file
  destination: function (req, file, cb) {
    try {
      cb(null, "./public/temp");
    } catch (err) {
      cb(new Error("Could not set the file destination"));
    }
  },
  // uniquefile name
  filename: function (req, file, cb) {
    // const originalName = file.originalname; // Keep the original file name
    // const uniqueSuffix = "-" + Date.now(); // Add a timestamp for uniqueness
    // cb(null, originalName + uniqueSuffix); // Append the timestamp to the original name
    cb(null, file.originalname); // Append the timestamp to the original name
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
});
// This initializes a Multer middleware instance using the storage configuration defined above.
// The middleware is now ready to handle file uploads with the specified destination and filename logic.
