const express = require("express");
const chatgptController = require("../controllers/chatgptController");

const router = express.Router();

router.route("/").get(chatgptController.getChatgpt);

module.exports = router;
