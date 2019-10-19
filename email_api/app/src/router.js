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
  let body = req.body;

  let error = checkBody(body.lastName, body.firstName, body.enterpriseName, body.reservationsList)

  if (!body.email) {
    error.push({ errEmail: true });
  }

  if (error.length != 0) {
    console.log("Error calling sendEmail", error);
    res.send(error).end();
  } else {
    emailHelper.sendEmail(req.body)
      .then(result => res.send(result).end())
      .catch(err => res.send(err).end());
  }
});

app.post("/sendManyEmail", (req, res) => {
  emailHelper.sendManyEmail(req.body.userList)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
});

app.put("/createQRCode", (req, res) => {
  let body = req.body;
  let error = checkBody(body.lastName, body.firstName, body.enterpriseName, body.reservationsList)

  if (error.length != 0) {
    console.log("Error calling createQRCode", error);
    res.send(error).end();
  } else {
    let result = qrCodeHelper.createQRCode(body)
    res.send(result).end();
  }
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Email API launched on port " + process.env.SERVER_PORT);
  emailHelper.initTransporter();
});


function checkBody(lastName, firstName, enterpriseName, reservationsList) {
  let error = [];

  if (!lastName || !firstName || !enterpriseName || !reservationsList || reservationsList.length == 0) {
    if (!lastName) {
      error.push({ errLastName: true });
    }

    if (!firstName) {
      error.push({ errFirstName: true });
    }

    if (!enterpriseName) {
      error.push({ errEnterpriseName: true });
    }

    if (!reservationsList || reservationsList.length == 0) {
      error.push({ errReservationsListNotEmpty: true });
    }
  }

  return error;
}