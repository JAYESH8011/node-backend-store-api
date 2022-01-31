const mongoose = require("mongoose")
const validator = require("validator")

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "please provide the product name"],
        maxLength: [200, "name should be less than 200 character"],
    },
    price: {
        type: Number,
        required: [true, "please provide product price"],
        maxLength: [6, "price should not be more than 6 digit"],
    },
    description: {
        type: String,
        required: [true, "please provide product description"],
    },
    photos: [
        {
            id: {
                type: String,
                required: [true, "please provide product image"],
            },
            securedUrl: {
                type: String,
            },
        },
    ],
    category: {
        type: String,
        required: [true, "category is required"],
        enum: {
            values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
            message:
                "category sshoud only be shortsleeves, longsleeves, sweatshirt and hoodies",
        },
    },
    brand: {
        type: String,
        required: [true, "please provide product brand"],
    },
    stock: {
        type: Number,
        required: [true, "please provide a number of stock"],
    },
    rating: {
        type: Number,
    },
    numOfReviews: {
        type: Number,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Product", productSchema)
