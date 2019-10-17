require("dotenv").config();

const cors = require("cors"),
  express = require("express"),
  app = express(),
  http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser"),
  emailHelper = require("./emailHelper");


app.use(bodyParser.json());
app.use(cors());

app.get("/*", (req, res, next) => {
  console.log("Request", req.headers);
  next();
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Launched on port " + process.env.SERVER_PORT);
});