const mongoose = require("mongoose")

const userSchema =  mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim: true,
        lowercase:true,
        unique:true,
        minLength:[3, "Username must be at least 3 characters long"]
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        minLength:[13, "Email must be at least 13 character long"]
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:[5, "Email must be at least 5 character long"]
    },
    files:[{
        type:mongoose.Types.ObjectId,
        ref:"files",
        default:[]
    }]
})


const user = mongoose.model("user", userSchema)

module.exports = user

