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

app.get("/yolo", (req, res) => {
  res.send({ res: "yolo" }).end();
});

app.put("/createBucket", (req, res) => {
  console.log("Start of Create bucket");

  emailHelper.createBucket(req.body.bucketName)
    .then(result => {console.log(result);
    res.send(result).end()})
    .catch(err => {console.log(err);
    res.send(err).end()});
  
});

app.put("/createObject", (req, res) => {
  console.log("Start of Create object");
  
  emailHelper.createObject(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
  
});

app.get("/listConf", (req, res) => {
  console.log("Got request on " + req.path);
  emailHelper.getListConf(req.body.bucketName)
    .then(result => {
      console.log("get went well", result);
      res.send(result).end();
    })
    .catch(err => {
      console.log("get went bad", err);
      res.send(err).end();
    });
});

app.delete("/removeBucket", (req, res) => {
  emailHelper.removeBucket(req.body.bucketName)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
  
});

app.delete("/removeObject", (req, res) => {
  emailHelper.removeObject(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
  
});

app.delete("/removeAllObjects", (req, res) => {
  emailHelper.removeAllObjects(req.body.bucketName)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
  
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Launched on port " + process.env.SERVER_PORT);
});