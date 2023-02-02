const express = require("express");
const practiceController = require("../controllers/practiceController");

const router = express.Router();

router.route("/practice").get(practiceController.getPractice);

module.exports = router;
