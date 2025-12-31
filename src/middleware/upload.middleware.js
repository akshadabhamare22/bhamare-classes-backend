import multer from "multer";
import path from "path";
import fs from "fs";

const assignmentDir = "uploads/assignments";
const submissionDir = "uploads/submissions";

[assignmentDir, submissionDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storageAssignment = multer.diskStorage({
  destination: assignmentDir,
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const storageSubmission = multer.diskStorage({
  destination: submissionDir,
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

export const uploadAssignment = multer({ storage: storageAssignment });
export const uploadSubmission = multer({ storage: storageSubmission });
