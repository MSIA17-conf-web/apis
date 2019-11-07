require("dotenv").config();

const cors = require("cors"),
  express = require("express"),
  app = express(),
  http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser"),
  qrCodeHelper = require("./qrCodeHelper"),
  emailHelper = require("./emailHelper");

app.use(bodyParser.json());
app.use(cors());

app.get("/*", (req, res, next) => {
  console.log("Request", req.path);
  next();
});

app.post("/sendEmail", (req, res) => {
  let error = [];
  if (error.length == 0) {
    emailHelper.sendMail(req.body)
      .then(result => res.send(result).end())
      .catch(err => res.send(err).end()
      );
  } else {
    res.send(error).end();
  }
});

app.post("/sendManyEmail", (req, res) => {
  let error = [];
  if (error.length == 0) {
    emailHelper.sendManyMail(req.body)
      .then(result => res.send(result).end())
      .catch(err => res.send(err).end());
  } else {
    res.send(error).end();
  }
});

app.put("/createQRCode", (req, res) => {
  let error = [];
  if (error.length != 0) {
    console.log("Error calling createQRCode", error);
    res.send(error).end();
  } else {
    let result = qrCodeHelper.createQRCode(req.body)
    res.send(result).end();
  }
});

emailHelper.initTransporter(() => {
  app.listen(process.env.SERVER_PORT, () => {
    console.log("Email API launched on port " + process.env.SERVER_PORT);
  });
});