// Charge Env Var
require("dotenv").config();

// Config Logger
const log = require("./logger").configLogger(
    process.env.log_level || "debug",
    "default"
  ),
  mdb = require("mongodb"),
  _ = require("lodash");

// Global connection object to the db
var con = null;

// Env vars
const MONGO_URL = process.env.MONGO_URL;

module.exports = {
  _initMongoDBConnection: () => {
    return new Promise((resolve, reject) => {
      connect()
        .then(val => {
          log.info("Connection to Mongo DB : OK ");
          resolve();
        })
        .catch(err => {
          log.info("Error connecting to mongodb" + err);
          reject();
        });
    });
  },
  _get: async body => {
    // TODO redo the error handler
    while (con.isConnected() != true) {
      log.info("Connection not setup, try to reconnect...");
      await connect();
    }
    return new Promise((resolve, reject) => {
      try {
        body = JSON.parse(body);
        log.debug("Parsed body :" + JSON.stringify(body));
        checkMongoDBOptions("GET", body)
          .then(db_options => {
            if (db_options.filter) {
              log.debug(
                "Asking for only one object : " +
                  JSON.stringify(db_options.filter)
              );
              var filter_key = db_options.filter.key,
                value = db_options.filter.value,
                query = {};
              query[filter_key] = value;
              log.info(
                "GET Query Details : " +
                  "\ndb : " +
                  db_options.db +
                  "\ncol : " +
                  db_options.col +
                  "\nFilter : " +
                  "\nKey : " +
                  filter_key +
                  "\nValue : " +
                  value
              );

              con
                .db(db_options.db)
                .collection(db_options.col)
                .findOne(query, { projection: { _id: 0 } })
                .then(doc => {
                  if (!doc) {
                    resolve({
                      result: {},
                      msg: "No passport found for" + JSON.stringify(query)
                    });
                  } else {
                    resolve({ result: doc });
                  }
                });
            } else {
              log.debug("Asking for every passport");
              log.info(
                "GET Query Details : " +
                  "\ndb : " +
                  db_options.db +
                  "\ncol : " +
                  db_options.col
              );
              con
                .db(db_options.db)
                .collection(db_options.col)
                .find({}, { projection: { _id: 0 } })
                .toArray((err, res) => {
                  log.info("Found " + res.length + " results.");
                  err ? reject({ error: err }) : resolve({ result: res });
                });
            }
          })
          .catch(err => {
            reject(err);
          });
      } catch (error) {
        reject({ error: error });
      }
    });
  },
  _insert: async body => {
    while (con.isConnected() != true) {
      log.info("Connection not setup, try to reconnect...");
      await connect();
    }
    return new Promise((resolve, reject) => {
      try {
        body = JSON.parse(body);
        // log.debug("Parsed body :" + JSON.stringify(body));
        checkMongoDBOptions("INSERT", body)
          .then(db_options => {
            log.info(
              "INSERT Query Details : " +
                "\ndb : " +
                db_options.db +
                "\ncol : " +
                db_options.col +
                "\nnb of object : " +
                db_options.objects.length
            );
            customInsert(db_options)
              .then(insert_results => {
                resolve({ result: insert_results });
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
  _delete: async body => {
    while (con.isConnected() != true) {
      log.info("Connection not setup, try to reconnect...");
      await connect();
    }
    return new Promise((resolve, reject) => {
      try {
        body = JSON.parse(body);
        log.debug("Parsed body :" + JSON.stringify(body));
        checkMongoDBOptions("DELETE", body)
          .then(db_options => {
            log.info(
              "DELETE Query Details : " +
                "\ndb : " +
                db_options.db +
                "\ncol : " +
                db_options.col +
                "\nfilter : " +
                db_options.key +
                "\nkeys : " +
                JSON.stringify(db_options.values)
            );

            customDelete(db_options)
              .then(deleted_results => {
                resolve({ result: deleted_results });
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
  _modify: async body => {
    while (con.isConnected() != true) {
      log.info("Connection not setup, try to reconnect...");
      connect();
    }
    return new Promise((resolve, reject) => {
      try {
        body = JSON.parse(body);
        log.debug("Parsed body :" + JSON.stringify(body));
        checkMongoDBOptions("MODIFY", body)
          .then(db_options => {
            log.info(
              "MODIFY Query Details : " +
                "\ndb : " +
                db_options.db +
                "\ncol : " +
                db_options.col +
                "\nnb of object : " +
                db_options.objects.length
            );
            customModify(db_options)
              .then(modify_results => {
                resolve({ result: modify_results });
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
  }
};

function connect() {
  return new Promise((resolve, reject) => {
    mdb.MongoClient.connect(MONGO_URL, { useNewUrlParser: true }, (err, db) => {
      if (err) {
        reject(err);
      } else {
        con = db;
        resolve();
      }
    });
  });
}

function customInsert(db_options) {
  return new Promise(async (resolve, reject) => {
    var insert_results = [],
      inserted = 0
    for (obj of db_options.objects) {
      await con
        .db(db_options.db)
        .collection(db_options.col)
        .updateOne(obj.filter, { $setOnInsert: obj.object }, { upsert: true })
        .then(result => {
          result = JSON.parse(result);
          // log.debug(JSON.stringify(result.result) + ("upserted" in result));
          if ("upserted" in result) {
            inserted++;
            insert_results.push({
              object: obj.filter,
              inserted: true
            });
          } else {
            log.debug(
              JSON.stringify(obj.filter) + " already exist, not inserted"
            );
            insert_results.push({
              object: obj.filter,
              inserted: false
            });
          }
        })
        .catch(err => {
          reject({
            error: "Error while inserting" + JSON.stringify(err)
          });
        });
    }
    log.debug(
      "Finish Inserting. \nModified : " +
        inserted +
        "\nNot found : " +
        (db_options.objects.length - inserted)
    );
    resolve(insert_results);
  });
}

function customModify(db_options) {
  return new Promise(async (resolve, reject) => {
    var modify_results = [],
      modified = 0;
    for (obj of db_options.objects) {
      await con
        .db(db_options.db)
        .collection(db_options.col)
        .replaceOne(obj.filter, obj.object)
        .then(result => {
          result = JSON.parse(result);
          log.debug(result);
          if (result.modifiedCount == 1) {
            modify_results.push({
              object: obj.filter,
              modified: true
            });
            modified++;
          } else {
            modify_results.push({
              object: obj.filter,
              modified: false,
              msg: "Not found"
            });
          }
        })
        .catch(err => {
          reject({
            error: "Error while modifying" + JSON.stringify(err)
          });
        });
    }
    log.debug(
      "Finish Modifying. \nModified : " +
        modified +
        "\nNot found : " +
        (db_options.objects.length - modified)
    );
    resolve(modify_results);
  });
}

function customDelete(db_options) {
  return new Promise(async (resolve, reject) => {
    var del_docs = [],
      deleted = 0,
      key = db_options.key,
      query = {};

    for (value of db_options.values) {
      query[key] = value;
      log.debug("Deleting : " + key + " - " + value);
      await con
        .db(db_options.db)
        .collection(db_options.col)
        .deleteMany(query)
        .then(result => {
          if (result.deletedCount != 0) {
            deleted++;
            del_docs.push({
              value: value,
              deleted: true
            });
          } else {
            log.debug(value + " not found")
            del_docs.push({
              value: value,
              deleted: false
            });
          }
        })
        .catch(err => {
          reject({ error: "Error while deleting : " + err });
        });
    }
    log.debug(
      "Finish Deleting. \nDeleted : " +
        deleted +
        "\nNot found : " +
        (db_options.values.length - deleted)
    );
    resolve(del_docs);
  });
}

function checkMongoDBOptions(method, body) {
  log.debug("Looking for " + method + " mdb options");
  return new Promise((resolve, reject) => {
    if (!("mongoDB_options" in body)) {
      reject({
        error:
          "Missing mongoDB_options object in body, needed keys : db and col"
      });
    } else {
      if (!("col" in body.mongoDB_options) || !("db" in body.mongoDB_options)) {
        reject({
          error:
            "Missing colection (col) or database (db) in mongoDB_options object"
        });
      } else {
        var options = {
          col: body.mongoDB_options.col,
          db: body.mongoDB_options.db
        };
        switch (method) {
          case "GET":
            if (body.mongoDB_options.filter)
              options.filter = body.mongoDB_options.filter;
            resolve(options);
            break;
          case "MODIFY":
          case "INSERT":
            if (!("objects" in body)) {
              reject({ error: 'No object "objects" in body' });
            } else {
              if (!Array.isArray(body.objects)) {
                reject({ error: "objects is not an array" });
              } else {
                if (body.objects.length == 0) {
                  reject({
                    error:
                      "objects is an empty array, nothing to " +
                      method.toLowerCase()
                  });
                } else {
                  var isFilter = true;
                  for (let i = 0; i < body.objects.length; i++) {
                    const obj = body.objects[i];
                    if (!("filter" in obj)) {
                      log.debug(JSON.stringify(obj) + " doesn't have a filter");
                      isFilter = false;
                      break;
                    }
                  }
                  if (!isFilter) {
                    reject({
                      error: "At least one object does not have a filter"
                    });
                  } else {
                    options.objects = body.objects;
                    resolve(options);
                  }
                }
              }
            }
            break;
          case "DELETE":
            if (!("key" in body) || !("values" in body)) {
              reject({ error: "key or values object is missing from body" });
            } else {
              var errors = [];
              if (typeof body.key !== "string") {
                errors.push("key is not a string");
              } else {
                if (body.key == "") errors.push("key is empty string");
              }
              if (!Array.isArray(body.values)) {
                errors.push("values is not an array");
              } else {
                if (body.values.length === 0)
                  errors.push("There are no values");
              }
              if (errors.length != 0) {
                reject({ error: errors });
              } else {
                options.key = body.key;
                options.values = body.values;
                resolve(options);
              }
            }
            break;
          default:
            log.debug(method + " is not a valid method");
            reject({
              error:
                "Error while checking mongoDB_options : " +
                method +
                " is not a valid method"
            });
            break;
        }
      }
    }
  });
}
