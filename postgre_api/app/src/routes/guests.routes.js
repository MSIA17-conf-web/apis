const routes = require('express').Router(),
    { db } = require('../db');

routes.post("/create", (req, res) => {
    db.guests.create(req.body)
        .then(data => {
            res.send({ err: data }).end();
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message,
                detail: err.detail
            }).end();
        })
})

routes.delete("/delete", (req, res) => {
    db.guests.delete(req.body)
        .then(data => {
            if (data == 0) {
                res.send({ res: "User not found", success: false }).end();
            } if (data == 1) {
                res.send({ res: "User deleted", success: true }).end();
            } else {
                res.send({ err: data })
            }
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message || err
            }).end();
        })
})

routes.get("/get-all", (req, res) => {
    db.guests.getAll()
        .then(data => {
            if (data) {
                res.send(data).end();
            } else {
                res.send({ err: "No user found." });
            }
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message || err
            }).end();
        })
})

routes.post("/get-one", (req, res) => {
    db.guests.getOne(req.body)
        .then(data => {
            if (data) {
                res.send(data).end();
            } else {
                res.send({ err: "User with email : " + req.body.email + " not found" });
            }
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message || err
            }).end();
        })
})

routes.put("/update", (req, res) => {
    db.guests.update(req.body)
        .then(data => {
            if (data == 0) {
                res.send({ res: "User not found", success: false }).end();
            } if (data == 1) {
                res.send({ res: "User update", success: true }).end();
            } else {
                res.send({ err: data })
            }
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message || err
            }).end();
        })
})

module.exports = routes;