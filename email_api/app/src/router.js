require("dotenv").config();

const cors = require("cors"),
  express = require("express"),
  app = express(),
  http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser"),
  qr = require('qr-image'),
  fs = require('fs'),
  emailHelper = require("./emailHelper");


app.use(bodyParser.json());
app.use(cors());

app.get("/*", (req, res, next) => {
  console.log("Request", req.path);
  next();
});

app.put("/createQRCode", (req, res) => {
  let body = req.body, qrCodeText, lastName = body.lastName,
    firstName = body.firstName, enterpriseName = body.enterpriseName,
    reservationsList = body.reservationsList;

  if (lastName && firstName && enterpriseName) {
    // Get the text to generate QR code
    qrCodeText = "Nom : " + lastName
     + "\nPrénom : " + firstName 
     + "\nEntreprise : " + enterpriseName;

    if (reservationsList && reservationsList.length != 0) {
      if (reservationsList.length == 1) {
        qrCodeText += '\n\nRéservation :';
      } else {
        qrCodeText += '\n\nRéservations :';
      }

      reservationsList.forEach(reservation => {
        qrCodeText += '\n- ' + reservation;
      })

      // Generate QR Code from text
      let qrCodePng = qr.imageSync(qrCodeText, { type: 'png' })

      console.log("qrCodePng", qrCodePng);


      // Generate a random file name 
      // let qr_code_file_name = new Date().getTime() + '.png';

      // fs.writeFileSync('../QRCodeTest/' + qr_code_file_name, qrCodePng, err => {

      //   if (err) {
      //     res.send(err).end();
      //   }

      // });



      console.log("return statement writeFileSync", qrCodePng.toString('base64'));
      res.send(qrCodePng.toString('base64')).end()

    }
  }
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Email API launched on port " + process.env.SERVER_PORT);
});