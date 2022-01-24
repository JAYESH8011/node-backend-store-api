const bigPromise = require("../middlewares/bigPromise")
const CustomError = require("../utils/customError")
const cloudinary = require("cloudinary").v2
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const { cookieToken } = require("../utils/cookieToken")
const User = require("../models/user")

exports.userSignUp = bigPromise(async (req, res, next) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return next(new CustomError("name email password is required", 400))
    }
    if (!req.files) {
        return next(new CustomError("photo is required", 400))
    }
    const { photo } = req.files
    const result = await cloudinary.uploader.upload(photo.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale",
    })
    const { secure_url, public_id } = result
    try {
        const user = await User.create({
            name,
            email,
            password,
            photo: {
                id: public_id,
                securedUrl: secure_url,
            },
        })
        user.password = undefined
        cookieToken(user, res)
    } catch (error) {
        await cloudinary.uploader.destroy(public_id)
        return next(error)
    }
})

exports.userLogin = bigPromise(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(new CustomError("email and password is required", 400))
    }
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        return next(new CustomError("email and password is invalid", 400))
    }
    const validatePassword = await user.isValidatePassword(password)
    if (!validatePassword) {
        return next(new CustomError("email and password is invalid", 400))
    }
    user.password = undefined
    cookieToken(user, res)
})

exports.userLogout = bigPromise(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    res.status(200).json({
        status: "ok",
        message: "successfully logout",
    })
})

exports.forgotPassword = bigPromise(async (req, res, next) => {
    const { email } = req.body
    if (!email) {
        return next(new CustomError("email is required", 400))
    }
    const user = await User.findOne({ email })
    if (!user) {
        return next(new CustomError("user does not exist try sign up", 400))
    }
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
    const token = await user.forgotPasswordToken()
    const url = `http://localhost:4000/password/reset/${token}`
    const info = await transporter.sendMail({
        from: "jayeshkalra2002@gmail.com",
        to: user.email,
        subject: "Password Reset",
        text: `copy past this link in your browser\n\n\n ${url}`,
    })
    console.log(info)
    res.status(200).json({
        status: "ok",
    })
})

exports.passwordReset = bigPromise(async (req, res, next) => {
    const { token } = req.params
    if (!token) {
        return next(new CustomError("invalid request", 400))
    }
    const encry = crypto.createHash("sha256").update(token).digest("hex")
    const user = await User.findOne({
        resetPasswordToken: encry,
        resetPasswordExpiy: { $gt: Date.now() },
    })
    if (!user) {
        return next(new CustomError("session has expired", 400))
    }
    const { newPassword, confirmPassword } = req.body
    if (!newPassword || !confirmPassword) {
        return next(
            new CustomError(
                "new password and confirm password is required",
                400
            )
        )
    }
    if (newPassword !== confirmPassword) {
        return next(
            new CustomError("password and confirm password not matched", 400)
        )
    }
    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpiy = undefined
    await user.save()
    cookieToken(user, res)
})

exports.userDashboard = bigPromise(async (req, res, next) => {
    const id = req.id
    const user = await User.findById(id)
    if (!user) {
        return next(new CustomError("user does not exist"))
    }
    res.status(200).json({
        status: "ok",
        user,
    })
})

exports.userPasswordUpdate = bigPromise(async (req, res, next) => {
    const id = req.id
    const user = await User.findById(id).select("+password")
    if (!user) {
        return next(new CustomError("user does not exist", 400))
    }
    const { oldPassword, newPassword, confirmPassword } = req.body
    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(
            new CustomError(
                "current password, old password and confirm Password is required",
                400
            )
        )
    }
    const validatePassword = await user.isValidatePassword(oldPassword)
    if (!validatePassword) {
        return next(new CustomError("current password is incorrect", 400))
    }
    if (newPassword !== confirmPassword) {
        return next(
            new CustomError("password and confirm password not matched", 400)
        )
    }
    user.password = newPassword
    await user.save()
    //TODO: send the new Token do
    res.status(201).json({
        status: "ok",
    })
})

exports.userProfileUpdate = bigPromise(async (req, res, next) => {
    const id = req.id
    const user = await User.findById(id)
    if (!user) {
        return next(new CustomError("user does not exist", 400))
    }
    const newData = {}
    if (req.body.name) {
        newData.name = req.body.name
    }
    if (req.body.email) {
        newData.email = req.body.email
    }
    if (req.files) {
        if (user.photo.id) {
            await cloudinary.uploader.destroy(user.photo.id)
        }
        const { photo } = req.files
        const result = await cloudinary.uploader.upload(photo.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale",
        })
        newData.photo = { id: result.public_id, securedUrl: result.secure_url }
    }
    const updatedUser = await User.findByIdAndUpdate(id, newData, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        status: "ok",
        updatedUser,
    })
})

// admin controllers

exports.adminAllUsers = bigPromise(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        status: "ok",
        users,
    })
})

exports.adminGetSingleUser = bigPromise(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        return next(new CustomError("provide id in url", 400))
    }
    const user = await User.findById(id)
    if (!user) {
        return next(new CustomError("user does not exist", 400))
    }
    res.status(200).json({
        status: "ok",
        user,
    })
})

exports.adminUpdateUser = bigPromise(async (req, res, next) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
        return next(new CustomError("user does not exist", 400))
    }
    const newData = {}
    if (req.body.name) {
        newData.name = req.body.name
    }
    if (req.body.email) {
        newData.email = req.body.email
    }
    if (req.files) {
        await cloudinary.uploader.destroy(user.photo.id)
        const { photo } = req.files
        const result = await cloudinary.uploader.upload(photo.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale",
        })
        newData.photo = { id: result.public_id, securedUrl: result.secure_url }
    }
    if (req.body.role) {
        newData.role = req.body.role
    }
    const updatedUser = await User.findByIdAndUpdate(id, newData, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        status: "ok",
        updatedUser,
    })
})

exports.adminDeleteUser = bigPromise(async (req, res, next) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
        return next(new CustomError("user does not exist", 400))
    }
    if (user.photo) {
        await cloudinary.uploader.destroy(user.photo.id)
    }
    await User.deleteOne({ _id: id })
    res.status(202).json({
        status: "ok",
    })
})
