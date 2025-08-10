const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const authMiddleware = require("../middleware/auth");
const fileModel = require("../models/files.model");
const userModel = require("../models/user.model");
const supabase = require("../config/supabase-client");

// upload file
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    const file = req.file;
    const { userId } = req.user;

    try {
      const { data, error } = await supabase.storage
        .from("d-drive")
        .upload(`${userId}/${file.originalname}`, file.buffer, { contentType: file.mimetype });

      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const newFile = await fileModel.create({
        fileName: file.originalname,
        userId,
        storageId: data.id,
      });

      const user = await userModel.findById(userId);
      const savedFiles = [...user.files, newFile._id];
      user.files = [...savedFiles];
      await user.save();

      res.status(200).json({ file: newFile, message: "uploaded succesfully" });
    } catch (err) {
      return res.status(400).json({ message: "file already exists" });
    }
  }
);

// delete file
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const file = await fileModel.findById(id);
    if (!file) return res.status(400).json({ message: "file not found." });
    const { error } = await supabase.storage
      .from("d-drive")
      .remove([`${userId}/${file.fileName}`]);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    await fileModel.findByIdAndDelete(id);
    res.status(200).send({ file, message: "Successfully deleted file" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// download file
router.get("/download/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const file = await fileModel.findById(id);
  if (!file) return res.status(400).json({ message: "File not found" });
  const { data, error } = await supabase.storage
    .from("d-drive")
    .createSignedUrl(file.fileName, 60, { download: true });

  if (error) return res.status(400).json({ message: error.message });

  res.status(200).json({ data, message: "This is download link" });
});

// get all files
router.get("/all", authMiddleware, async (req, res) => {
  const { userId } = req.user;

  const {data , error} = await supabase.storage.from("d-drive").list(userId, {sortBy:{column:"name", order:"asc"}})

  if(error) return res.status(400).json({ message: error.message });

  res.status(200).json({ data, message: "succesfully" });
});

// rename file
router.post("/rename/:id", authMiddleware, async (req, res) => {
  const { newName } = req.body;
  const { id } = req.params;
  const { userId } = req.user;

  const file = await fileModel.findById(id);

  const splitted = file.fileName.split(".");
  splitted[0] = newName;

  const oldName = file.fileName
  const newFileName = splitted.join(".")

  const {  error } = await supabase.storage.from("d-drive").move(`${userId}/${oldName}`, `${userId}/${newFileName}`);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  file.fileName = newFileName; // update the filename in mongoose

  // update the path 

  await file.save();

  res.status(200).json({ message: "renamed successfully" });
});

module.exports = router;
