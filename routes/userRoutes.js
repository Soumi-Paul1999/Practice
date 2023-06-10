const express = require ("express");
const { signup, login, signin, verify, test } = require("../controllers/userController");
const router = express.Router()


/**http request */
router.route('/signup').post(signup)
router.route('/login').post(login)
router.route("/test").get(test)
router.route("/signin").get(signin)
router.route("/verify").get(verify)
// router.route("/product/getbill").post(getBill)

module.exports = router;