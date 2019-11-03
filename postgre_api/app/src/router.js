require("dotenv").config();

const cors = require("cors"),
  express = require("express"),
  app = express(),
  http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser"),
  postgreHelper = require("./postgreHelper");

app.use(bodyParser.json());
app.use(cors());

// GET — / | displayHome()
// GET — /users | getUsers()
// GET — /users/:id | getUserById()
// POST — users | createUser()
// PUT — /users/:id | updateUser()
// DELETE — /users/:id | deleteUser()

app.get("/*", (req, res, next) => {
  console.log("Request", req.path);
  next();
});

app.get("/test", (req, res) => {
  let result = postgreHelper.getTest()
  console.log("/test", result);

  res.send("ok").end();
});

app.get("/getAllGuest", (req, res) => {
  let body = req.body;

  let error = checkBody(body.table, body.orderBy)

  if (error.length != 0) {
    console.log("Error calling getAllGuest", error);
    res.send(error).end();
  } else {
    postgreHelper.getAll(body)
      .then(result => res.send(result).end())
      .catch(err => res.send(err).end());
  }
});

app.post("/createGuest", (req, res) => {
  let body = req.body;

  let error = checkBody(body.table, false, body.lastName, body.firstName, body.enterpriseName, body.email);

  if (error.length != 0) {
    console.log("Error calling createGuest", error);
    res.send(error).end();
  } else {
    postgreHelper.createGuest(body)
      .then(result => res.send(result).end())
      .catch(err => res.send(err).end());
  }
});

app.put("/updateGuest", (req, res) => {
  let body = req.body;

  let error = checkBody(body.table, false, body.lastName, body.firstName, body.enterpriseName, body.email, body.id);

  if (error.length != 0) {
    console.log("Error calling createGuest", error);
    res.send(error).end();
  } else {
    postgreHelper.updateGuest(body)
      .then(result => res.send(result).end())
      .catch(err => res.send(err).end());
  }
});

app.delete("/removeGuest", (req, res) => {
  let body = req.body;

  postgreHelper.removeGuest(body)
    .then(result => res.send(result).end())
    .catch(err => res.send(err).end());
});

postgreHelper.initConnection().then(ok => {
  console.log(ok);
  app.listen(process.env.SERVER_PORT, () => {
    console.log("Postgre API launched on port " + process.env.SERVER_PORT);
  });
}).catch(err => {
  console.log('Error connecting to DB', err);
});

function checkBody(table, orderBy, lastName, firstName, enterpriseName, email, id) {
  let error = [];

  if (!table || !orderBy || !lastName || !firstName || !enterpriseName || !email || id) {
    if (!table) {
      error.push({ errTable: true });
    }

    if (!orderBy) {
      error.push({ errOrderBy: true });
    }

    if (!lastName) {
      error.push({ errLastName: true });
    }

    if (!firstName) {
      error.push({ errFirstName: true });
    }

    if (!enterpriseName) {
      error.push({ errEnterpriseName: true });
    }

    if (!email) {
      error.push({ errEmail: true });
    }

    if (!id) {
      error.push({ errId: true });
    }
  }

  return error;
}