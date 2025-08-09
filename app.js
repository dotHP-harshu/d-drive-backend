const express  = require('express')
const app  = express()
const userRouter = require('./routes/user.routes')
const fileRouter = require('./routes/file.routes')
require("dotenv").config();
const cookieParser = require("cookie-parser")

const connectDb  = require("./config/db")
connectDb()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get("/", (req, res) => {
  res.send("hello world");
});
app.use('/user', userRouter)
app.use('/file', fileRouter)


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})