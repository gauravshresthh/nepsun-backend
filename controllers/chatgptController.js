const { Configuration, OpenAIApi } = require("openai");

exports.getChatgpt = (req, res, next) => {
  // const welcomeText =
  //   "Welcome to Hamro Service API, This is an API for Hamro service multi-platform software. This is a practice API. changed global email and username";

  // return res.status(200).json({ status: "success", data: welcomeText });
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  async function runCompletion() {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "How is life going?",
    });
    console.log(completion.data.choices[0].text);
  }

  runCompletion();
};
