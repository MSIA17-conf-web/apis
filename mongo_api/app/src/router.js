// Charge Env Var
const env = require("dotenv").config();
// Configure logger
const log = require("./logger").configLogger(
  process.env.log_level || "debug",
  "default"
  );
  log.debug(env.parsed);

const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mgHelper = require("./mongodbHelper");

app.use(bodyParser.json());

app.get("/env", (req, res) => {
  res.send(env.parsed).end();
});

app.post("/get", (req, res) => {
  log.debug("Got request on " + req.path);
  mgHelper
    ._get(JSON.stringify(req.body))
    .then(result => {
      log.debug("get went well");
      res.send(result).end();
    })
    .catch(err => {
      log.debug("get went bad", err);
      res.send(err).end();
    });
});

app.post("/insert", (req, res) => {
  log.debug("Got request on " + req.path);
  mgHelper
    ._insert(JSON.stringify(req.body))
    .then(result => {
      log.debug("insert went well");
      res.send(result).end();
    })
    .catch(err => {
      log.debug("insert went bad", err);
      res.send(err).end();
    });
});

app.post("/delete", (req, res) => {
  log.debug("Got request on " + req.path);
  mgHelper
    ._delete(JSON.stringify(req.body))
    .then(result => {
      log.debug("delete went well");
      res.send(result).end();
    })
    .catch(err => {
      log.debug("delete went bad", err);
      res.send(err).end();
    });
});

app.post("/modify", (req, res) => {
  log.debug("Got request on " + req.path);
  mgHelper
    ._modify(JSON.stringify(req.body))
    .then(result => {
      log.debug("modify went well");
      res.send(result).end();
    })
    .catch(err => {
      log.debug("modify went bad", err);
      res.send(err).end();
    });
});

mgHelper
  ._initMongoDBConnection()
  .then(() => {
    app.listen(process.env.PORT, () => {
      log.info("Launched on port " + process.env.PORT);
    });
  })
  .catch(() => {
    // Maybe a routine of reconnection try ?
  });
