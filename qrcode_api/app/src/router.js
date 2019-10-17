// Charge Env Var
require("dotenv").config();

const cors = require("cors"),
  express = require("express"),
  app = express(),
  // http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser"),
  qr = require('qr-image'),
  fs = require('fs');


const apiName = "/qrcode_api";

app.use(bodyParser.json());
app.use(cors());

app.get("/*", (req, res, next) => {
  console.log("Request", req.headers);
  next();
});

app.put(apiName + "/createQRCode", (req, res) => {
  let body = req.body, qrCodeText, nom = body.nom,
    prenom = body.prenom, enterpriseName = body.enterpriseName,
    reservationList = body.reservationList;

  if (nom && prenom && enterpriseName) {
    // Get the text to generate QR code
    qrCodeText = nom + ' ' + prenom + '\n'
    enterpriseName;

    if (reservationList.length != 0) {
      if (reservationList.length == 0) {
        qrCodeText += '\nRéservation :';
      } else {
        qrCodeText += '\nRéservations :';
      }

      reservationList.forEach(reservation => {
        qrCodeText += '\n' + reservation;
      })

      // Generate QR Code from text
      let qrCodePng = qr.imageSync(qrCodeText, { type: 'png' })

      console.log("qrCodePng", qrCodePng);
      

      // Generate a random file name 
      let qr_code_file_name = new Date().getTime() + '.png';

      fs.writeFileSync('../QRCodeTest/' + qr_code_file_name, qrCodePng, (err) => {

        if (err) {
          console.log(err);
        }

      });
    }
  }
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Launched on port " + process.env.SERVER_PORT);
});

function createQRCodeText(nom, prenom, enterpriseName) {
  return nom + ' ' + prenom + '\n'
  enterpriseName;
}