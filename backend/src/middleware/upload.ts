import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "patient-documents"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    cb
  ) => {
    cb(null, uploadDirectory);
  },

  filename: (
    _req,
    file,
    cb
  ) => {
    const extension =
      path.extname(file.originalname);

    const uniqueName =
      `${Date.now()}-${crypto
        .randomBytes(8)
        .toString("hex")}${extension}`;

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}`
      )
    );
  }
};

export const patientDocumentUpload =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        10 * 1024 * 1024,
    },
  });