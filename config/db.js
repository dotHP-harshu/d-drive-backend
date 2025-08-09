const mongoose = require("mongoose")
require("dotenv").config()

function connetDb (){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Connected to database... ")
    })
}

module.exports = connetDb