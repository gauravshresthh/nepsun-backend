exports.getHome = (req, res, next) => {
  const welcomeText = "Welcome to Sresta API, Test API";

  return res.status(200).json({ status: "success", data: welcomeText });
};

exports.hahaha = (req, res, next) => {
  const data = [
    { id: 1, name: "bibsi" },
    { id: 2, name: "gaurav" },
  ];

  return res.json({ status: "success", data });
};

exports.product = (req, res, next) => {
  const id = req.params.id;
  const text = `You requested for product ${id}`;
  return res.json({ status: "success", data: text });
};
