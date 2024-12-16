import multer from "multer";

const storage = multer.diskStorage({
  // file destination to store file
  destination: function (req, file, cb) {
    // cb is callback, null indicates no error, second para provides path where the file is store
    cb(null, "../../public/temp");
  },
  // uniquefile name
  filename: function (req, file, cb) {
    const originalName = file.originalname; // Keep the original file name
    const uniqueSuffix = '-' + Date.now(); // Add a timestamp for uniqueness
    cb(null, originalName + uniqueSuffix); // Append the timestamp to the original name
  },
});

export const upload = multer({ storage: storage });
// This initializes a Multer middleware instance using the storage configuration defined above.
// The middleware is now ready to handle file uploads with the specified destination and filename logic.