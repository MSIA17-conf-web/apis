require("dotenv").config();

const cors = require("cors"),
    express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    postgreHelper = require("./postgreHelper");

app.use(bodyParser.json());
app.use(cors());

app.all("/*", (req, res, next) => {
    console.log("Request on ", req.path);
    next();
});

app.post("/from-file", (req, res) => {
    checkBody("from-file", req.body, err => {
        if (err.length != 0) {
            console.log(err);
            res.send({ err: err }).end()
        } else {
            postgreHelper.execFromFile(req.body)
                .then(data => {                  
                    
                    res.send({ res: data.map((tmp => { return tmp.json})) }).end();
                })
                .catch(err => {
                    console.log('prout', err);
                    
                    res.send({ err: err }).end()
                })
        }
    })
})

postgreHelper.initConnection().then(ok => {
    console.log(ok);
    app.listen(process.env.SERVER_PORT, () => {
        console.log("Postgre API launched on port " + process.env.SERVER_PORT);
    });
}).catch(err => {
    console.log('Error connecting to DB', err);
});

function checkBody(method, body, cb) {
    let err = [];

    switch (method) {
        case "from-file":

            break;

        default:
            err.push({ methodNotExist: "The method" + method + "isn't supported" })
            break;
    }


    cb(err)
}