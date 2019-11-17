require('dotenv').config();

const cors = require('cors'),
  express = require('express'),
  app = express(),
  http = require('http'),
  // https = require('https'),
  bodyParser = require('body-parser'),
  minioHelper = require('./minioHelper'),
  { check, validationResult } = require('express-validator');


app.use(bodyParser.json());
app.use(cors());

app.get('/*', (req, res, next) => {
  console.log('Request', req.path);
  next();
});

app.put('/createBucket', [
  checkBody('bucketName', 'notEmpty')
], (req, res) => {
  let error = checkError(req, res);
  if (error) {
    return res.send(error).end();
  }
  console.log('Start of create bucket');
  minioHelper.createBucket(req.body.bucketName)
    .then(result => {
      res.send(result).end()
    })
    .catch(err => {
      res.send(err).end();
    });

});

app.put('/createFile', [
  checkBody('bucketName', 'notEmpty'),
  checkBody('fileName', 'notEmpty'),
  checkBody('fileName', 'notEmpty')
], (req, res) => {
  let error = checkError(req, res);
  if (error) {
    return res.send(error).end();
  }
  console.log('Start of create file');
  minioHelper.createFile(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());

});

app.get('/listConfBuckets', (req, res) => {
  minioHelper.getListConfBuckets()
    .then(result => {
      console.log('get went well', result);
      res.send(result).end();
    })
    .catch(err => {
      console.log('get went bad', err);
      res.send(err).end();
    });
});

app.post('/listConfFiles', [
  checkBody('bucketName', 'notEmpty')
], (req, res) => {
  let error = checkError(req, res);
  if (error) {
    return res.send(error).end();
  }
  console.log('Got request on{ fileName: fileName } ' + req.path);
  minioHelper.getListConfFiles(req.body.bucketName)
    .then(result => {
      res.send(result).end();
    })
    .catch(err => {
      res.send(err).end();
    });
});

app.post('/getFile', [
  checkBody('bucketName', 'notEmpty'),
  checkBody('fileName', 'notEmpty')
], (req, res) => {
  let error = checkError(req, res);
  if (error) {
    return res.send(error).end();
  }
  minioHelper.getFile(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
})

app.delete('/removeBucket', [
  checkBody('bucketName', 'notEmpty')
], (req, res) => {
  let error = checkError(req, res);
  if (error) {
    return res.send(error).end();
  }
  minioHelper.removeBucket(req.body.bucketName)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());

});

app.delete('/removeFile', [
  checkBody('bucketName', 'notEmpty'),
  checkBody('fileName', 'notEmpty')
], (req, res) => {
  let error = checkError(req, res);
  if (error) {
    return res.send(error).end();
  }
  minioHelper.removeFile(req.body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());

});

app.delete('/removeAllFiles', [
  checkBody('bucketName', 'notEmpty')
], (req, res) => {
  let error = checkError(req, res);
  if (error) {
    return res.send(error).end();
  }
  minioHelper.removeAllFiles(req.body.bucketName)
    .then(result => {
      res.send(result).end()
    })
    .catch(err => {
      res.send(err).end()
    });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log('Minio API launched on port ' + process.env.SERVER_PORT);
});

function checkBody(attribut, method) {
  switch (method) {
    case 'notEmpty':
      return check(attribut).not().isEmpty().withMessage('Ce champ est obligatoire');

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
