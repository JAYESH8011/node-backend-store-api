const CustomError = require("../utils/customError")
const bigPromise = require("../middlewares/bigPromise")

exports.home = bigPromise((req, res, next) => {
    res.send("<h2>this is the Ecoom app under contruction</h2>")
})
