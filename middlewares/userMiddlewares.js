const jwt = require("jsonwebtoken")
const User = require("../models/user")
const CustonError = require("../utils/customError")
const bigPromise = require("./bigPromise")

exports.isLoggedIn = bigPromise((req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return next(new CustonError("session has expired", 400))
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) {
        return next(new CustonError("token has expired", 400))
    }
    req.id = decoded.id
    next()
})

exports.checkRole = (role) => {
    return async (req, res, next) => {
        try {
            const id = req.id
            const user = await User.findById(id)
            if (!user) {
                return next(new CustonError("user does not exist", 400))
            }
            if (user.role === role) {
                req.user = user
                return next()
            }
            return next(new CustonError("you are not authorized", 400))
        } catch (error) {
            return next(new CustonError(error.message, 400))
        }
    }
}
