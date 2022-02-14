const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: [true, "Address is required"],
        },
        city: {
            type: String,
            required: [true, "City is required"],
        },
        phoneNo: {
            type: Number,
            required: [true, "Phone No is required"],
        },
        postalCode: {
            type: Number,
            required: [true, "Postal code is required"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
        },
        country: {
            type: String,
            required: [true, "Country is required"],
        },
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true,
            },
        },
    ],
    paymentInfo: {
        id: {
            type: String,
            required: true,
        },
    },
    taxAmount: {
        type: Number,
        required: true,
    },
    shippingAmount: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        default: "processing",
    },
    deliveredAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Order", orderSchema)
