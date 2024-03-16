const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/../public");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      "IMG-" +
        Date.now() +
        Math.round(Math.random() * 10000) +
        "." +
        file.mimetype.split("/")[1]
    );
  },
});

const fileFilter = (req, file, cb) => {
  const { mimetype } = file;

  switch (mimetype) {
    case "image/jpeg":
    case "image/png":
    case "image/gif":
      cb(null, true);
      break;
    default:
      cb(new Error("File format is not accepted"));
      break;
  }
};

exports.multerUpload = multer({
  storage,
  fileFilter,
});
