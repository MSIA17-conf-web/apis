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
  mqttHelper = require("./mqttHelper");

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  log.debug(req.method + " request on : " + req.path);
  next();
});

app.get("/env", (req, res) => {
  res.send(env.parsed).end();
});

app.post("/get-messages", (req, res) => {
  mqttHelper
    ._getMessages(JSON.stringify(req.body))
    .then(result => {
      log.debug("get-messages went well");
      res.send(result).end();
    })
    .catch(err => {
      log.debug("get-messages went bad" + JSON.stringify(err));
      res.send(err).end();
    });
});

app.post("/send-messages", (req, res) => {
  mqttHelper
    ._sendMessages(JSON.stringify(req.body))
    .then(result => {
      log.debug("send-messages went well");
      res.send(result).end();
    })
    .catch(err => {
      log.debug("send-messages went bad" + JSON.stringify(err));
      res.send(err).end();
    });
});

_init();

function _init() {
  mqttHelper
    ._initMqttConnexion()
    .then(result => {
      app.listen(process.env.port, () => {
        log.info("Launched on port " + process.env.port);
      });
    })
    .catch(err => {
      log.debug("Cannot connect to MQTT, retry" + JSON.stringify(err));
      _init();
    });
}
