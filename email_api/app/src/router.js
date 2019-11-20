require("dotenv").config();

const cors = require("cors"),
  express = require("express"),
  app = express(),
  http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser"),
  qrCodeHelper = require("./qrCodeHelper"),
  emailHelper = require("./emailHelper"),
  { check, validationResult } = require('express-validator');

app.use(bodyParser.json());
app.use(cors());

app.get("/*", (req, res, next) => {
  console.log("Request", req.path);
  next();
});

app.post("/sendEmail", [
  // new url for all template ?
  // checkBody('templateName', 'notEmpty'),
  // checkBody('data.from', 'notEmpty'),
  // checkBody('data.to', 'email'),
  // checkBody('data.templateOptions.lName', 'notEmpty'),
  // checkBody('data.templateOptions.lName', 'length', 2),
  // checkBody('data.templateOptions.fName', 'notEmpty'),
  // checkBody('data.templateOptions.fName', 'length', 2),
  // checkBody('data.templateOptions.company', 'notEmpty'),
  // checkBody('data.templateOptions.company', 'length', 2),
  // checkBody('data.templateOptions.conferences', 'arrayNotEmpty')
], (req, res) => {
  console.log('yolo')
  
  let error = checkError(req, res);
  if (error) {
    return res.status(422).json(error);
  }
console.log("req.path", req.path);

  emailHelper.sendMail(req.body, req.path)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end()
    );
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

function checkBody(attribut, method, value) {
  switch (method) {
    case 'notEmpty':
      return check(attribut).not().isEmpty().withMessage('Ce champ est obligatoire');

    case 'json':
      return check(attribut).isJSON().withMessage('Doit-être au format JSON');

      case 'length':
        return check(attribut).isLength({ min: 2 }).withMessage('Ce champ doit contenir au minimu ' + value + ' caractères');

    case 'email':
      return check(attribut).not().isEmpty().withMessage('Ce champ est obligatoire').isEmail();

    case 'arrayNotEmpty':
      return check(attribut).isArray().not().isEmpty().withMessage('Ce tableau ne doit pas être vide');

    default:
      break;
  }
}

function checkError(req, res) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
}
