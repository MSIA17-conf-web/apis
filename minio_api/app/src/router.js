// Charge Env Var
const env = require("dotenv").config(),
  cors = require("cors"),
  Minio = require('minio'),
  express = require("express"),
  app = express(),
  http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser");
  
var minioClient = new Minio.Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});


app.use(bodyParser.json());
app.use(cors());

app.get("/yolo", (req, res) => {
  res.send("yolo").end();
});

app.get("/hello", (req, res) => {
  // File that needs to be uploaded.
  // var file = 'README.md'

  // Make a bucket called europetrip.
  var metaData = {
    'Content-Type': 'application/octet-stream',
    'X-Amz-Meta-Testing': 1234,
    'example': 5678
  }
    // Using fPutObject API upload your file to the bucket europetrip.
    minioClient.fPutObject('zefzef', 'README.md', "./README.md", metaData, function (err, etag) {
      if (err) return console.log(err)
      console.log('File uploaded successfully.')
    });
  

  // minioClient.makeBucket('zefzef', 'us-east-1', function(err) {
  //   if (err) return console.log('Error creating bucket.', err)
  //   console.log('Bucket created successfully in "us-east-1".')
  // })

  res.send("Hello world!").end();
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Launched on port " + process.env.SERVER_PORT);
});