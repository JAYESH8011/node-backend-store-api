const express = require("express")
const {
    createOrder,
    getOneOrder,
    getMyOrders,
    adminGetOrders,
    adminUpdateOrder,
    adminDeleteOrder,
} = require("../controllers/orderController")
const { isLoggedIn, checkRole } = require("../middlewares/userMiddlewares")
const router = express.Router()

router.route("/order/create").post(isLoggedIn, createOrder)
router.route("/order/:oid").get(isLoggedIn, getOneOrder)
router.route("/myorders").get(isLoggedIn, getMyOrders)
router
    .route("/admin/orders")
    .get(isLoggedIn, checkRole("admin"), adminGetOrders)
router
    .route("/admin/:oid")
    .put(isLoggedIn, checkRole("admin"), adminUpdateOrder)
    .delete(isLoggedIn, checkRole("admin"), adminDeleteOrder)
module.exports = router
