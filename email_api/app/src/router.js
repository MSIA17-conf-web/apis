require("dotenv").config();

const cors = require("cors"),
  express = require("express"),
  app = express(),
  http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser"),
  qrcodeHelper = require("./qrcodeHelper"),
  emailHelper = require("./emailHelper");

app.use(bodyParser.json());
app.use(cors());

app.get("/*", (req, res, next) => {
  console.log("Request", req.path);
  next();
});

app.post("/sendEmail", (req, res) => {
  emailHelper.sendEmail(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
});

app.put("/createQRCode", (req, res) => {
  qrcodeHelper.createQRCode(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Email API launched on port " + process.env.SERVER_PORT);
});