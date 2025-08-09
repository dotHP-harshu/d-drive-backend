const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
    fileName:{
        type:String,
        required:[true, "fileName is required."],
        unique:[true, "file already exists."]
    },
    path:{
        type:String,
    },
    storageId:{
        type:String,
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"users"
    },
    
})

const fileModel = mongoose.model("file", fileSchema)

module.exports = fileModel