exports.getHome = (req, res, next) => {
  const welcomeText =
    'Welcome to Nepsun API, This is an API for Nepsun classified multi-vendor software';

  return res.status(200).json({ status: 'success', data: welcomeText });
};
