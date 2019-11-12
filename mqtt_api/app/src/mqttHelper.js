// Charge Env Var
require("dotenv").config();

// Config Logger
const log = require("./logger").configLogger(
    process.env.log_level || "debug",
    "default"
  ),
  mqtt = require("mqtt");

// Global connection object to the db
var con = null;

const mqtt_host = process.env.MQTT_HOST,
  mqtt_port = process.env.MQTT_PORT;

module.exports = {
  _initMqttConnexion: () => {
    return new Promise((resolve, reject) => {
      connect()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  _getMessages: async body => {
    while (con.connected != true) {
      log.info("Connexion not setup, try to reconnect...");
      await connect();
    }
    return new Promise(async (resolve, reject) => {
      try {
        body = JSON.parse(body);
        // log.debug("Parsed body :" + JSON.stringify(body));

        checkBody("get-messages", body)
          .then(async mqtt_options => {
            log.debug(
              "MQTT Query details : \ntimeout : " +
                mqtt_options.request_timeout +
                "\ntopic ot sub to : " +
                mqtt_options.sub_to +
                "\nmessage to send : " +
                mqtt_options.pub_to.length
            );
            var messages_to_send = [];
            for (msg of mqtt_options.pub_to) {
              messages_to_send.push(msg.message);
            }
            await subscribeTo(mqtt_options.sub_to)
              .then(granted => {
                log.debug("Subscription to : ");
                for (obj of granted) {
                  log.debug(obj.topic);
                }
                log.debug("OK. Setting up message handling");
                var responses = [];
                con.on("message", (topic, message) => {
                  if (!messages_to_send.includes(message.toString()))
                    responses.push({
                      topic: topic,
                      message: message.toString()
                    });
                });
                // Sending messages
                customSend(mqtt_options.pub_to).then(sended_messages => {
                  if (!sended_messages.result.isOk) {
                    log.debug("error while sending message");
                    // List which message haven't been sent
                  }
                  log.debug("waiting : " + mqtt_options.request_timeout);
                  setTimeout(async () => {
                    log.debug(
                      "waiting : " + mqtt_options.request_timeout + " finished"
                    );
                    await unsubscribeFrom(mqtt_options.sub_to)
                      .then(() => {
                        console.log("Got " + responses.length+ " messages from MQTT");
                        
                        resolve({ result: responses });
                      })
                      .catch(err => {
                        resolve({ result: responses, error: err });
                      });
                    con.removeAllListeners(["message"]);
                  }, mqtt_options.request_timeout);
                });
              })
              .catch(err => {
                reject({ error: err });
              });
          })
          .catch(err => {
            reject(err);
          });
      } catch (error) {
        reject({ error: error });
      }
    });
  },
  _sendMessages: async body => {
    while (con.connected != true) {
      log.info("Connexion not setup, try to reconnect...");
      await connect();
    }
    return new Promise((resolve, reject) => {
      try {
        body = JSON.parse(body);
        log.debug("Parsed body :" + JSON.stringify(body));
        checkBody("send-messages", body)
          .then(async mqtt_options => {
            log.debug("MQTT Query details : " + JSON.stringify(mqtt_options));

            await customSend(mqtt_options.messages).then(sended_messages => {
              resolve(sended_messages);
            });
          })
          .catch(err => {
            reject(err);
          });
      } catch (error) {
        reject({ error: error });
      }
    });
  }
  // TODO set out of exportss
};
function subscribeTo(topics) {
  log.debug("Subing to : " + topics);
  return new Promise((resolve, reject) => {
    if (!Array.isArray(topics))
      reject({ error: "topics is not an array (from subscribeTo())" });
    con.subscribe(topics, (err, granted) => {
      if (err) {
        log.debug("Error while subscribing : " + err);
        reject({ error: "" + err });
      } else {
        resolve(granted);
      }
    });
  });
}

function unsubscribeFrom(topics) {
  log.debug("Unsubscribing from : " + topics);
  return new Promise((resolve, reject) => {
    if (!Array.isArray(topics))
      reject({ error: "topics is not an array (from unsubscribeFrom())" });
    con.unsubscribe(topics, (err) => {
      if (err) {
        log.debug("Error while unsubscribing : " + err);
        reject({ error: "" + err });
      } else {
        log.debug("Unsub OK");
        resolve();
      }
    });
  });
}

function customSend(messages) {
  return new Promise(async resolve => {
    var sended_messages = [],
      isError = false;
    sended = 0;
    for (msg of messages) {
      con.publish(msg.topic, msg.message, err => {
        if (err) {
          sended_messages.push({
            topic: msg.topic,
            msg: msg.length,
            sended: false,
            error: JSON.stringify(err)
          });
          isError = true;
          log.debug("Error sending message" + err);
        } else {
          sended_messages.push({
            topic: msg.topic,
            msg: msg.length,
            sended: true
          });
          sended++;
        }
      });
    }
    log.debug(
      "Message sent. Results : \nMessage sent :  " +
        sended +
        "/" +
        messages.length
    );
    resolve({ result: { isOk: !isError, sended_messages } });
  });
}

function checkBody(method, body) {
  console.log("Body to check", body);

  return new Promise(async (resolve, reject) => {
    log.debug("Looking for " + method + " MQTT Options ");
    switch (method) {
      case "get-messages":
        if (
          !("request_timeout" in body) ||
          !("sub_to" in body) ||
          !("pub_to" in body)
        ) {
          reject({
            error:
              "incomplete body, need : request_timeout(string), sub_to(object), pub_to(object)"
          });
        } else {
          var type_error = [];
          // Type check
          if (typeof body.request_timeout !== "string")
            type_error.push("request timeout is not a string");
          if (!Array.isArray(body.sub_to))
            type_error.push("request sub_to is not an array");
          if (!Array.isArray(body.pub_to))
            type_error.push("request pub_to is not an array");
          if (type_error.length != 0) {
            reject({ error: type_error });
          } else {
            // Check if sub_to is array of string only
            var isStr = true;
            for (str in body.sub_to) {
              if (typeof str !== "string") isStr = false;
            }
            if (!isStr) {
              reject({ error: "One of the topic in sub_to is not a string" });
            }
            // Check if pub_to is ok
            for (obj of body.pub_to) {
              // Check if pub_to is array of object only
              // log.debug("current obj : " + JSON.stringify(obj));
              if (typeof obj !== "object") {
                reject({
                  error: {
                    error: "One of the messages in pub_to is not an object",
                    obj: obj
                  }
                });
                break;
              }
              // Check if each message have topic and message
              if (!("topic" in obj) || !("message" in obj)) {
                reject({
                  error: {
                    error:
                      "One of the message in pub_to do not have topic or message",
                    obj: obj
                  }
                });
                break;
              } else {
                if (
                  typeof obj.topic !== "string" ||
                  typeof obj.message !== "string" ||
                  obj.topic.length == 0 ||
                  obj.message.length == 0
                ) {
                  reject({
                    error: {
                      error:
                        "Every obj of pub_to should have a topic (string) and a message (string) and be empty string",
                      obj: obj
                    }
                  });
                }
              }
            }
          }
          resolve(body);
        }
        break;
      case "send-messages":
        if (!("messages" in body)) {
          reject({ error: "Missing messages object in body" });
        } else {
          if (!Array.isArray(body.messages)) {
            reject({ error: "messages is not an array" });
          } else {
            var errors = [];
            for (msg of body.messages) {
              var msgErr = [];
              if (typeof msg !== "object") {
                msgErr.push("should be an object with topic and message key");
              } else {
                if (!("topic" in msg)) {
                  msgErr.push("no topic set");
                } else {
                  if (typeof msg.topic !== "string")
                    msgErr.push("topic is not a string");
                  if (msg.topic.length == 0) msgErr.push("topic is empty");
                }
                if (!("message" in msg)) {
                  msgErr.push("no message set");
                } else {
                  if (typeof msg.message !== "string")
                    msgErr.push("message is not a string");
                  if (msg.message.length == 0) msgErr.push("message is empty");
                }
              }
              if (msgErr.length != 0)
                errors.push({
                  msg: msg,
                  errors: msgErr
                });
            }
            if (errors.length != 0) {
              reject({ error: errors });
            } else {
              log.debug("No errors in body");
              resolve(body);
            }
          }
        }
        break;

      default:
        reject({ error: "No body check for " + method });
        break;
    }
    resolve(body);
  });
}

function connect(params) {
  return new Promise((resolve, reject) => {
    log.info("connecting to MQTT server");
    log.debug("MQTT Host : " + mqtt_host + "\nMQTT Port : " + mqtt_port);

    con = mqtt.connect("mqtt://" + mqtt_host + ":" + mqtt_port, {
      username: "conf",
      password: "conf"
    });

    con.on("connect", () => {
      log.info("Connected to MQTT");
      setInterval(() => {
        con.publish("/angular", JSON.stringify({message: "Did you get that Angular ? "}));
      },1000)
      resolve();
    });
    con.on("error", err => {
      reject({ error: "Error while connecting to MQTT" + err });
    });
  });
}
