const express = require("express")
const {
    addProduct,
    getAllProducts,
    getSingleProduct,
    adminGetAllProducts,
    adminUpdateOneProduct,
    adminDeleteOneProduct,
    addReview,
    deleteReview,
} = require("../controllers/productController")
const { isLoggedIn, checkRole } = require("../middlewares/userMiddlewares")
const router = express.Router()

router.route("/getallproducts").get(getAllProducts)
router.route("/getproduct/:pid").get(getSingleProduct)
router.route("/addreview").put(isLoggedIn, addReview)
router.route("/deletereview").delete(isLoggedIn, deleteReview)

//admin routes
router.route("/addproduct").post(isLoggedIn, checkRole("admin"), addProduct)
router
    .route("/admin/allproducts")
    .get(isLoggedIn, checkRole("admin"), adminGetAllProducts)
router
    .route("/admin/product/:pid")
    .put(isLoggedIn, checkRole("admin"), adminUpdateOneProduct)
    .delete(isLoggedIn, checkRole("admin"), adminDeleteOneProduct)

module.exports = router
