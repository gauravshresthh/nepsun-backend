function randomNumberGenerator(min, max) {
	const minimumValue = min || 1000;
	const maximumValue = max || 9999;
	const randomNumber =
		Math.floor(Math.random() * (maximumValue - minimumValue + 1)) +
		minimumValue;
	return randomNumber;
}

module.exports = randomNumberGenerator;
