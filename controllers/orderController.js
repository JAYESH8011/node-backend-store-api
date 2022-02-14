const bigPromise = require("../middlewares/bigPromise")
const Order = require("../models/order")
const Product = require("../models/product")
const User = require("../models/user")
const CustomError = require("../utils/customError")

exports.createOrder = bigPromise(async (req, res, next) => {
    const user = await User.findById(req.id).lean()
    if (!user) {
        return next(new CustomError("user not found", 400))
    }
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body
    const order = await Order.create({
        shippingInfo,
        user: user._id,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    })
    order.orderItems.forEach(async (elem) => {
        await Product.findByIdAndUpdate(elem.product, {
            $inc: { stock: -elem.quantity },
        })
    })
    res.status(200).json({
        status: "ok",
        order,
    })
})

exports.getOneOrder = bigPromise(async (req, res, next) => {
    const { oid } = req.params
    const order = await Order.findById(oid).populate("user", "name email")
    if (!order) {
        return next(new CustomError("check the order id", 401))
    }
    if (order.user._id.toString() !== req.id) {
        return next(new CustomError("this is not your order", 400))
    }
    res.status(200).json({
        status: "ok",
        order,
    })
})

exports.getMyOrders = bigPromise(async (req, res, next) => {
    const orders = await Order.find({ user: req.id })
    res.status(200).json({
        status: "ok",
        orders,
    })
})

exports.adminGetOrders = bigPromise(async (req, res, next) => {
    const orders = await Order.find()
    res.status(200).json({
        status: "ok",
        orders,
    })
})

exports.adminUpdateOrder = bigPromise(async (req, res, next) => {
    const { oid } = req.params
    const order = await Order.findById(oid)
    if (!order) {
        return next(new CustomError("check your order id", 400))
    }
    const { orderStatus } = req.body
    if (!orderStatus) {
        return next(new CustomError("status is required", 400))
    }
    if (
        order.orderStatus === "delivered" ||
        order.orderStatus === "cancelled"
    ) {
        return next(
            new CustomError(`product has been ${order.orderStatus}`, 400)
        )
    }

    if (orderStatus === "delivered") {
        order.orderStatus = orderStatus
        order.deliveredAt = Date.now()
    } else if (orderStatus === "cancelled") {
        order.orderStatus = orderStatus
        order.orderItems.forEach(async (elem) => {
            await Product.findByIdAndUpdate(elem.product, {
                $inc: { stock: elem.quantity },
            })
        })
    } else {
        order.orderStatus = orderStatus
    }
    await order.save()
    res.status(200).json({
        status: "ok",
        order,
    })
})

exports.adminDeleteOrder = bigPromise(async (req, res, next) => {
    const { oid } = req.params
    await Order.findByIdAndRemove(oid)
    res.status(200).json({
        status: "ok",
    })
})
