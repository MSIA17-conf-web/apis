require("dotenv").config();

const cors = require("cors"),
  express = require("express"),
  app = express(),
  http = require("http"),
  // https = require("https"),
  bodyParser = require("body-parser"),
  Pool = require('pg').Pool,
  pool = new Pool({
    user: 'admin',
    host: 'postgre',
    database: 'conferences',
    password: 'admin',
    port: 5432,
  }),
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

  res.send("ok").end();
});

app.put("/selectAll", (req, res) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (err, results) => {
    if (err) {
      res.send({err: err})
    }
    console.log("results", results);
    
    res.status(200).json(results.rows).end();
  });
});

app.put("/createFile", (req, res) => {


});

app.get("/listConfBuckets", (req, res) => {

});

app.post("/listConfFiles", (req, res) => {

});

app.post("/getFile", (req, res) => {

});

app.delete("/removeBucket", (req, res) => {

});

app.delete("/removeFile", (req, res) => {

});

app.delete("/removeAllFiles", (req, res) => {

});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Postgre API launched on port " + process.env.SERVER_PORT);
});