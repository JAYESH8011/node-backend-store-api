const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const validator = require("validator")
const crypto = require("crypto")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: [40, "name must be less than 40 charcter"],
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "email already exist"],
        validate: [(val) => validator.isEmail(val), "email is invalid"],
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "password must be atleast 6 character long"],
        select: false,
    },
    photo: {
        id: {
            type: String,
        },
        securedUrl: {
            type: String,
        },
    },
    role: {
        type: String,
        default: "user",
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpiy: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
})
userSchema.methods.isValidatePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.getJwtToken = function () {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    })
    return token
}
userSchema.methods.forgotPasswordToken = async function () {
    const val = crypto.randomBytes(20).toString("hex")
    const token = require("crypto")
        .createHash("sha256")
        .update(val)
        .digest("hex")
    this.resetPasswordToken = token
    this.resetPasswordExpiy = new Date(Date.now() + 30 * 60 * 1000)
    try {
        await this.save()
    } catch (error) {
        console.log(error)
        this.resetPasswordToken = undefined
        this.resetPasswordExpiy = undefined
    }
    return val
}
module.exports = mongoose.model("User", userSchema)
