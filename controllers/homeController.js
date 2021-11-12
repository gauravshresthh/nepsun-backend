exports.getHome = (req, res, next) => {
	const welcomeText =
		'Welcome to Hamro Service API, This is an API for Hamro service multi-platform software';

	return res.status(200).json({ status: 'success', data: welcomeText });
};
