require("dotenv").config();

const cors = require("cors"),
    express = require("express"),
    { check, validationResult } = require('express-validator'),
    app = express(),
    bodyParser = require("body-parser"),
    postgreHelper = require("./postgreHelper");

app.use(bodyParser.json());
app.use(cors());

app.all("/*", (req, res, next) => {
    console.log("Request on ", req.path);
    next();
});

app.use("/guests", require("./guests/guests.routes"));

app.post("/from-file", [
    check('fileName').isString().not().isEmpty(),
    check('options').not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send({ errors: errors.array() }).end();
    } else {
        postgreHelper.execFromFile(req.body)
            .then(data => {
                res.send(data.map((tmp => { return tmp.json }))).end();
            })
            .catch(err => {
                console.log('prout', err);
                res.send({ err: err }).end()
            })
    }
})

postgreHelper.initConnection().then(ok => {
    console.log(ok);
    app.listen(process.env.SERVER_PORT, () => {
        console.log("Postgre API launched on port " + process.env.SERVER_PORT);
    });
}).catch(err => {
    console.log('Error connecting to DB', err);
});
