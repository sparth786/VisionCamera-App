const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path=require('path')


const app = express();
const port = 4001;

const uploadDir =  path.join(__dirname,"../storage");
console.log(path.join(__dirname,"../storage"));

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }


const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname);
  }
});


const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new Error("Not a video file! Please upload only videos."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadVideo = upload.single("video");

app.get("/", (req, res) => {
  res.send({
    message: "Hello world"
  });
});

app.post("/uploadVideo", (req, res) => {
  console.log(req.file)
  uploadVideo(req, res, (err) => {
    if(err) {
      return res.status(400).json({ message: err.message });
    }
    res.status(200).json({ message: "Video uploaded successfully!" });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
