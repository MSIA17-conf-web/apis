// Charge Env Var
require("dotenv").config();

const axios = require("axios"),
  cors = require("cors"),
  express = require("express"),
  app = express(),
  // http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser");


app.use(bodyParser.json());
app.use(cors());

// if common api mettre en commentaire
// app.all("*", (req, res, next) => {
//   console.log("Got request on : " + req.path);
//   next();
// });

app.all("/api/*", (req, res) => {
  try {
    console.log("Request", req.headers);
    console.log("");

    checkBody("api", req.body)
      .then(checkedBody => {
        console.log("yoooolo");

        // Get specific api url
        let regexApi = new RegExp("\/.*");
        let apiUrl = checkedBody.url.match(regexApi)[0].substring(1);

        console.log("checkedBody.url", apiUrl);

        axios
          .request({
            method: checkedBody.method,
            url: apiUrl,
            baseUrl: checkedBody.baseUrl,
            data: checkedBody.data
          })
          .then(response => {
            console.log("response from ", checkedBody.baseUrl);
            console.log(response.data.result);

            res.send(response.data.result).end();
          })
          .catch(err => {
            console.log("Error during api request ", err);

            res.send(err).end();
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

app.listen(process.env.SERVER_PORT, () => {
  console.log("Launched on port " + process.env.SERVER_PORT);
});

function checkBody(method, body) {
  return new Promise((resolve, reject) => {
    switch (method) {
      case "api":
        console.log("body", body);
        console.log("body.method", body.method);
        // Check existence 
        var missing_opt = []

        if (!("method" in body)) missing_opt.push("method is missing from body")
        if (!("url" in body)) missing_opt.push("url is missing from body")
        if (!("baseURL" in body)) missing_opt.push("baseURL is missing from body")
        if (!("data" in body)) missing_opt.push("data is missing from body")

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
            type_error.push("data must be an object");

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

              resolve(bobodydy)
            }body
          }body
        }body
        break;

      default:
        reject({ error: "No body check for " + method });
        break;
    }
  });
}