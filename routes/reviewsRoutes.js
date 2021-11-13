const express = require('express');
const reviewsController = require('../controllers/reviewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(reviewsController.getAllReviews)
	.post(authController.protect, reviewsController.createReviews);

router
	.route('/:id')
	.get(reviewsController.getReviews)
	.put(authController.protect, reviewsController.updateReviews)
	.delete(authController.protect, reviewsController.deleteReviews);

module.exports = router;
