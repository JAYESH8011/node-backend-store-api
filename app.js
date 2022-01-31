const express = require("express")
const fileUpload = require("express-fileupload")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const { errorHandler } = require("./middlewares/errorHandler")
const homeRoute = require("./routes/homeRoute")
const userRoute = require("./routes/userRoute")
const productRoutes = require("./routes/productRoutes")
require("./config/conn").connect()
const app = express()
const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// regular middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
)

// morgan for logger
app.use(morgan("tiny"))

//routes
app.use("/", homeRoute)
app.use("/", userRoute)
app.use("/", productRoutes)

// error handler middleware
app.use(errorHandler)

module.exports = app
