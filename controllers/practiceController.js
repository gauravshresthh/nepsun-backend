exports.getPractice = (req, res, next) => {
  const welcomeText =
    "Welcome to Hamro Service API, This is an API for Hamro service multi-platform software. This is a practice API. changed global email and username";

  return res.status(200).json({ status: "success", data: welcomeText });
};
