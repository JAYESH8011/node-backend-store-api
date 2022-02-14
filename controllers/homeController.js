const CustomError = require("../utils/customError")
const bigPromise = require("../middlewares/bigPromise")

exports.home = bigPromise((req, res, next) => {
    res.send("<h2>Ecoom app backend api</h2>")
})
