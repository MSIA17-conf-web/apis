require("dotenv").config();

const express = require('express'),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    { db } = require("./db");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.all("/*", (req, res, next) => {
    console.log("Request on ", req.path);
    next();
});

app.use("/guests", require("./routes/guests.routes"));
app.use("/misc", require("./routes/misc.routes"));

db.proc('version')
    .then(data => {
        console.log("Connection to db OK " + data.version);
        app.listen(process.env.SERVER_PORT, () => {
            console.log("Postgre API launched on port " + process.env.SERVER_PORT);
        })
    })
    .catch(err => {
    console.log('Error connecting to DB', err);
        process.exit();
    })

