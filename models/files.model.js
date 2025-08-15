const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
  fileName: {
    type: String,
    required: [true, "fileName is required."],
  },
  storageId: {
    type: String,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "users",
  },
});

const fileModel = mongoose.model("file", fileSchema)

module.exports = fileModel