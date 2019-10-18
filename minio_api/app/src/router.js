require("dotenv").config();

const cors = require("cors"),
  express = require("express"),
  app = express(),
  http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser"),
  minioHelper = require("./minioHelper");


app.use(bodyParser.json());
app.use(cors());

app.get("/*", (req, res, next) => {
  console.log("Request", req.path);
  next();
});

app.put("/createBucket", (req, res) => {
  console.log("Start of create bucket");

  minioHelper.createBucket(req.body.bucketName)
    .then(result => {
      res.send(result).end()
    })
    .catch(err => {
      res.send(err).end();
    });

});

app.put("/createFile", (req, res) => {
  console.log("Start of create file");

  minioHelper.createFile(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());

});

app.get("/listConfBuckets", (req, res) => {
  console.log("Got request on " + req.path);
  minioHelper.getListConfBuckets()
    .then(result => {
      console.log("get went well", result);
      res.send(result).end();
    })
    .catch(err => {
      console.log("get went bad", err);
      res.send(err).end();
    });
});

app.post("/listConfFiles", (req, res) => {
  console.log("Got request on{ fileName: fileName } " + req.path);
  minioHelper.getListConfFiles(req.body.bucketName)
    .then(result => {
      res.send(result).end();
    })
    .catch(err => {
      res.send(err).end();
    });
});

app.post("/getFile", (req, res) => {
  minioHelper.getFile(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
})

app.delete("/removeBucket", (req, res) => {
  minioHelper.removeBucket(req.body.bucketName)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());

});

app.delete("/removeFile", (req, res) => {
  minioHelper.removeFile(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());

});

app.delete("/removeAllFiles", (req, res) => {
  minioHelper.removeAllFiles(req.body.bucketName)
    .then(result => {
      console.log("okok");
      res.send(result).end()
    })
    .catch(err => {
      console.log(
        "enculé"
      );
      res.send(err).end()
    });

});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Minio API launched on port " + process.env.SERVER_PORT);
});