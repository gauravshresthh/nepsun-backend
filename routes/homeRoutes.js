const express = require("express");
const homeController = require("../controllers/homeController");

const router = express.Router();

router.route("/").get(homeController.getHome);
router.route("/hahaha").get(homeController.hahaha);
router.route("/product/:id").get(homeController.product);

module.exports = router;
