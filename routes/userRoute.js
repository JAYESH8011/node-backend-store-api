const express = require("express")
const {
    userSignUp,
    userLogin,
    userLogout,
    forgotPassword,
    passwordReset,
    userDashboard,
    userPasswordUpdate,
    userProfileUpdate,
    adminAllUsers,
    adminGetSingleUser,
    adminUpdateUser,
    adminDeleteUser,
} = require("../controllers/userController")
const { isLoggedIn, checkRole } = require("../middlewares/userMiddlewares")
const router = express.Router()

router.route("/signup").post(userSignUp)
router.route("/login").post(userLogin)
router.route("/logout").get(userLogout)
router.route("/forgotpassword").post(forgotPassword)
router.route("/password/reset/:token").post(passwordReset)
router.route("/user").get(isLoggedIn, userDashboard)
router.route("/user/passwordupdate").post(isLoggedIn, userPasswordUpdate)
router.route("/user/update").put(isLoggedIn, userProfileUpdate)

// admin routes
router.route("/admin/users").get(isLoggedIn, checkRole("admin"), adminAllUsers)
router
    .route("/admin/user/:id")
    .get(isLoggedIn, checkRole("admin"), adminGetSingleUser)
    .put(isLoggedIn, checkRole("admin"), adminUpdateUser)
    .delete(isLoggedIn, checkRole("admin"), adminDeleteUser)

module.exports = router
