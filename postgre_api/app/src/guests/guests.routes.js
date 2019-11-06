const routes = require('express').Router(),
    pgHelper = require('../postgreHelper');

routes.get("/create", (req, res) => {
    res.send({ mess: "guests/create not implemented" }).end();
})

routes.get("/delete", (req, res) => {
    res.send({ mess: "guests/delete not implemented" }).end();
})

routes.get("/getAll", (req, res) => {
    res.send({ mess: "guests/getAll not implemented" }).end();
})

routes.get("/getOne", (req, res) => {
    res.send({ mess: "guests/getOne not implemented" }).end();
})

routes.get("/update", (req, res) => {
    res.send({ mess: "guests/update not implemented" }).end();
})


module.exports = routes;

// CREATE USER
// UPDATE USER
// DELETE USER BY EMAIL
// GET ALL USERS
// GET ONE USER BY ANYTHING