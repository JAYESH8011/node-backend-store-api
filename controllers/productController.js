const bigPromise = require("../middlewares/bigPromise")
const Product = require("../models/product")
const CustomError = require("../utils/customError")
const cloudinary = require("cloudinary").v2
const WhereClause = require("../utils/whereClause")
const User = require("../models/user")

exports.addProduct = bigPromise(async (req, res, next) => {
    const { name, price, description, brand, category, stock } = req.body
    if (!name || !price || !description || !brand || !category || !stock) {
        return next(new CustomError("all fields are required", 400))
    }
    if (!req.files) {
        return next(new CustomError("product photos are required", 400))
    }
    const { photos } = req.files
    let imageArray = []
    for (let index = 0; index < photos.length; index++) {
        const result = await cloudinary.uploader.upload(
            photos[index].tempFilePath,
            {
                folder: "products",
            }
        )
        imageArray.push({ id: result.public_id, securedUrl: result.secure_url })
    }
    try {
        const product = await Product.create({
            name,
            price,
            description,
            photos: imageArray,
            category,
            brand,
            stock,
            user: req.user._id,
        })
        res.status(201).json({
            status: "ok",
            product,
        })
    } catch (error) {
        for (let index = 0; index < imageArray.length; index++) {
            cloudinary.uploader.destroy(imageArray[index].id)
        }
        return next(new CustomError(error.message, 400))
    }
})

exports.getAllProducts = bigPromise(async (req, res, next) => {
    const productObj = new WhereClause(Product.find(), req.query)
    const productBase = productObj.searchProduct().filter().pager(6)
    const product = await productBase.base.select("-user")
    res.status(200).json({
        status: "ok",
        product,
    })
})

exports.getSingleProduct = bigPromise(async (req, res, next) => {
    const { pid } = req.params
    if (!pid) {
        return next(new CustomError("product is not available", 400))
    }
    const product = await Product.findById(pid).select("-user")
    if (!product) {
        return next(new CustomError("product is not available", 400))
    }
    res.status(200).json({
        status: "ok",
        product,
    })
})

exports.adminGetAllProducts = bigPromise(async (req, res, next) => {
    const products = Product.find()
    res.status(200).json({
        status: "ok",
        products,
    })
})

exports.adminUpdateOneProduct = bigPromise(async (req, res, next) => {
    const { pid } = req.params
    const newData = {}
    const product = await Product.findById(pid).lean()
    if (!product) {
        return next(new CustomError("Product not found", 400))
    }
    if (req.files) {
        let imageArray = []
        for (let i = 0; i < product.photos.length; i++) {
            await cloudinary.uploader.destroy(product.photos[i].id)
        }
        const { photos } = req.files
        for (let i = 0; i < photos.length; i++) {
            const result = await cloudinary.uploader.upload(
                photos[i].tempFilePath,
                {
                    folder: "products",
                }
            )
            imageArray.push({
                id: result.public_id,
                securedUrl: result.secure_url,
            })
        }
        newData.photos = imageArray
    }
    newData.name = req.body.name || product.name
    newData.price = req.body.price || product.price
    newData.description = req.body.description || product.description
    newData.brand = req.body.brand || product.brand
    newData.category = req.body.category || product.category
    newData.stock = req.body.stock || product.stock

    const updatedProduct = await Product.findByIdAndUpdate(pid, newData, {
        runValidators: true,
        new: true,
    }).lean()
    res.status(201).json({
        status: "ok",
        updatedProduct,
    })
})

exports.adminDeleteOneProduct = bigPromise(async (req, res, next) => {
    const { pid } = req.params
    console.log(pid)
    const product = await Product.findById(pid).lean()
    if (!product) {
        return next(new CustomError("Product not found", 400))
    }
    console.log(product)
    for (let index = 0; index < product.photos.length; index++) {
        await cloudinary.uploader.destroy(product.photos[index].id)
    }
    await Product.deleteOne({ _id: pid })
    res.status(202).json({
        status: "ok",
    })
})

exports.addReview = bigPromise(async (req, res, next) => {
    const { productId, comment, rating } = req.body
    if (!productId || !comment || !rating) {
        return next(new CustomError("fields are required", 400))
    }
    const user = await User.findById(req.id)
    if (!user) {
        return next(new CustomError("User not found", 400))
    }
    const review = {
        user: user._id,
        name: user.name,
        rating,
        comment,
    }
    const product = await Product.findById(productId)
    if (!product) {
        return next(new CustomError("Product not found", 400))
    }
    const alreadyReviewed = product.reviews.find((elem) => {
        return elem.user.toString() === user._id.toString()
    })
    if (alreadyReviewed) {
        product.reviews = product.reviews.filter((elem) => {
            return elem.user.toString() !== user._id.toString()
        })
    }
    product.reviews.push(review)
    product.numOfReviews = product.reviews.length
    let totalRating = 0
    product.reviews.forEach((elem) => {
        totalRating += elem.rating
    })
    product.rating = totalRating / product.numOfReviews
    await product.save({ validateBeforeSave: false })
    res.status(202).json({
        status: "ok",
        rating: product.rating,
        numOfReviews: product.numOfReviews,
        reviews: product.reviews,
    })
})

exports.deleteReview = bigPromise(async (req, res, next) => {
    const id = req.id
    const { pid } = req.body
    const product = await Product.findById(pid)
    product.reviews = product.reviews.filter((elem) => {
        return elem.user.toString() !== id.toString()
    })
    product.numOfReviews = product.reviews.length
    let totalRating = 0
    product.reviews.forEach((elem) => {
        totalRating += elem.rating
    })
    product.rating = totalRating / product.numOfReviews || 0
    await product.save({ validateBeforeSave: false })
    res.status(202).json({
        status: "ok",
        rating: product.rating,
        numOfReviews: product.numOfReviews,
        reviews: product.reviews,
    })
})
