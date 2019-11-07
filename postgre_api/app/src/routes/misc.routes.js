const routes = require('express').Router(),
    { db } = require('../db');

routes.get("/conf-form-data", (req, res) => {
    db.misc.getConfFormData()
        .then(data => {
            res.send(data.map((tmp => { return tmp.json }))).end();
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message || err
            }).end();
        })
})

routes.get("/conf-display-data", (req, res) => {
    db.misc.getConfDisplayData()
        .then(data => {
            res.send(data.map((tmp => { return tmp.json }))).end();
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message || err
            }).end();
        })
})
module.exports = routes;
