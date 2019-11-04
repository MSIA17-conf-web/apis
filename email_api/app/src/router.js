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

  let error = checkBody(body)

  if (!body.userEmail) {
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
  if(!Array.isArray(req.body.userList) || !req.body.userList) {
    res.send({err: "userList doesn't exist or is not an array"}).end();
  } else {
    let errors = []
    req.body.userList.forEach(body => {
      let error = checkBody(body) 
      error.length != 0 ? errors.push(error) : null;
      
    });
    
    if(errors.length == 0) {
      emailHelper.sendManyEmail(req.body)
        .then(result => res.send(result).end())
        .catch(err => res.send(err).end());
    } else {
      res.send(errors).end();
    }    
  }
});

app.put("/createQRCode", (req, res) => {
  let body = req.body;
  let error = checkBody(body)

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


function checkBody(body) {
  let error = [];

  if (!body.lastName || !body.firstName || !body.enterpriseName || !body.reservationsList || body.reservationsList.length == 0) {
    error.push({for: body})
    if (!body.lastName) {
      error.push({ errLastName: true });
    }

    if (!body.firstName) {
      error.push({ errFirstName: true });
    }

    if (!body.enterpriseName) {
      error.push({ errEnterpriseName: true });
    }

    if (!body.reservationsList || body.reservationsList.length == 0) {
      error.push({ errReservationsListNotEmpty: true });
    }
  }

  return error;
}