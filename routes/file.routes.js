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
        .upload(`${userId}/${file.originalname}`, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        return res
          .status(400)
          .json({ success: false, code: error.status, message: error.message });
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

      res.status(200).json({
        success: true,
        code: 200,
        data: { message: "uploaded succesfully", file: newFile },
      });
    } catch (err) {
      return res
        .status(400)
        .json({ message: err.message, success: false, code: 400 });
    }
  }
);

// delete file
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const file = await fileModel.findOne({ storageId: id, userId });
    if (!file)
      return res
        .status(400)
        .json({ message: "file not found.", success: false, code: 400 });
    const { error } = await supabase.storage
      .from("d-drive")
      .remove([`${userId}/${file.fileName}`]);
    if (error) {
      return res
        .status(400)
        .json({ message: error.message, code: error.status, success: false });
    }
    await fileModel.findByIdAndDelete(file._id);
    res.status(200).send({
      success: true,
      code: 200,
      data: { file, message: "Successfully deleted file" },
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message, code: 400, success: false });
  }
});

// download file
router.get("/download/:id", authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const file = await fileModel.findOne({ storageId: id, userId });
  if (!file)
    return res
      .status(404)
      .json({ message: "File not found", success: false, code: 404 });
  const { data, error } = await supabase.storage
    .from("d-drive")
    .createSignedUrl(userId + "/" + file.fileName, 60, { download: true });

  if (error)
    return res
      .status(400)
      .json({ message: error.message, success: false, code: error.status });

  res.status(200).json({
    success: true,
    code: 200,
    data: { signedUrl: data.signedUrl, message: "This is download link" },
  });
});

// get all files
router.get("/all", authMiddleware, async (req, res) => {
  const { userId } = req.user;

  const { data, error } = await supabase.storage
    .from("d-drive")
    .list(userId, { sortBy: { column: "name", order: "asc" } });

  if (error) return res.status(400).json({ message: error.message });

  res.status(200).json({
    success: true,
    code: 200,
    data: { files: data, message: "successfully get files" },
  });
});

// rename file
router.post("/rename/:id", authMiddleware, async (req, res) => {
  const { newName } = req.body;
  const { id } = req.params;
  const { userId } = req.user;

  const file = await fileModel.findOne({ storageId: id, userId });
  if (!file)
    return res
      .status(400)
      .json({ message: "file not found.", success: false, code: 400 });

  const splitted = file.fileName.split(".");

  if (splitted[0] === newName)
    return res.status(200).json({
      data: { file, message: "renamed successfully" },
      success: true,
      code: 200,
    });

  splitted[0] = newName;

  const oldName = file.fileName;
  const newFileName = splitted.join(".");

  const { error } = await supabase.storage
    .from("d-drive")
    .move(`${userId}/${oldName}`, `${userId}/${newFileName}`);

  if (error) {
    return res
      .status(400)
      .json({ message: error.message, code: 400, success: false });
  }

  file.fileName = newFileName; // update the filename in mongoose

  // update the path

  await file.save();

  res.status(200).json({
    data: { file, message: "renamed successfully" },
    success: true,
    code: 200,
  });
});

module.exports = router;
