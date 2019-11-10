// Charge Env Var
require("dotenv").config();

const axios = require("axios"),
  cors = require("cors"),
  express = require("express"),
  https = require('https'),
  fs = require('fs'),
  app = express(),
  bodyParser = require("body-parser");

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/www.msia17conferences.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/www.msia17conferences.com/fullchain.pem"),
  ca: fs.readFileSync("/etc/letsencrypt/live/www.msia17conferences.com/chain.pem")
};

const httpsServer = https.createServer(options, app)

app.use(bodyParser.json());
app.use(cors());

app.all("/api", (req, res) => {
  try {
    checkBody("api", req.body)
      .then(checkedBody => {
        console.log("checkedBody", checkedBody);

        axios
          .request({
            method: checkedBody.method,
            url: checkedBody.url,
            baseURL: checkedBody.baseURL,
            data: checkedBody.body
          })
          .then(response => {
            console.log("response from", checkedBody.baseURL);
            res.send(response.data).end();
          })
          .catch(function (error) {
            if (error.response) {
              console.log("RESPONSE ERROR");
              // console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.statusText)
              res.send({
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                success: false
              }).end();
            } else if (error.request) {
              console.log("REQUEST ERROR");
              res.send({ err: "request error", success: false, msg: "The host surely doesn't exist" }).end();
            } else {
              console.log('Error', error.message);
              res.send({ err: "Error setting up the request", success: false, msg: error.message }).end();
            }
          });
      })
      .catch(err => {
        console.log("err", err);
        res.send(err).end();
      });
  } catch (err) {
    console.log("Error parsing body to JSON", err);
    res.send({ error: err }).end();
  }
});

httpsServer.listen(process.env.SERVER_PORT, () => {
  console.log("Common API launched on port " + process.env.SERVER_PORT);
});

function checkBody(method, body) {
  return new Promise((resolve, reject) => {
    switch (method) {
      case "api":
        // Check existence 
        var missing_opt = []

        if (!("method" in body)) missing_opt.push("method is missing from body")
        if (!("url" in body)) missing_opt.push("url is missing from body")
        if (!("baseURL" in body)) missing_opt.push("baseURL is missing from body")
        if (!("body" in body)) missing_opt.push("body is missing from body")

        if (missing_opt.length != 0) {
          reject({ error: missing_opt })
        } else {
          // Type check
          var type_error = []

          if (typeof body.method !== "string")
            type_error.push("method must be a string");
          if (typeof body.url !== "string")
            type_error.push("request must be a string");
          if (typeof body.baseURL !== "string")
            type_error.push("baseURL must be a string");
          if (typeof body.body !== "object")
            type_error.push("body must be an object");

          if (type_error.length != 0) {
            reject({ error: type_error })
          } else {
            // Content Check
            var content_error = []

            if (body.method.length == 0 || body.method == "") content_error.push("body.method must not be empty")
            if (body.url.length == 0 || body.url == "") content_error.push("body.url must not be empty")
            if (body.baseURL.length == 0 || body.baseURL == "") content_error.push("body.baseURL must not be empty")

            if (content_error.length != 0) {
              reject({ error: content_error })
            } else {
              console.log("body check for + " + method + " OK ");

              resolve(body)
            }
          }
        }
        break;

      default:
        reject({ error: "No body check for " + method });
        break;
    }
  });
}