const routes = require('express').Router(),
    { db } = require('../db'),
    { check, validationResult } = require('express-validator');

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

routes.post("/get-conf-name", [
    checkBody('confId', 'notEmpty'),
    checkBody('confId', 'integer')
    // check integer or numeric ?
], (req, res) => {
    let error = checkError(req, res);
    if (error) {
        return res.send(error).end();
    }
    db.misc.getConfName(req.body).then(data => {
        console.log("get-conf-name", data);
        res.send(data.json).end();
    })
        .catch(err => {
            console.log(err);
            res.send({
                err: err.message || err
            })
        })
})

module.exports = routes;

function checkBody(attribut, method, value) {
    switch (method) {
        case 'notEmpty':
            return check(attribut).not().isEmpty().withMessage('Ce champ est obligatoire');

        case 'length':
            return check(attribut).isLength({ min: 2 }).withMessage('Ce champ doit contenir au minimu ' + value + ' caractères');

        case 'email':
            return check(attribut).not().isEmpty().withMessage('Ce champ est obligatoire').isEmail();

        case 'integer':
            return check(attribut).isNumeric().withMessage('Ce champ doit être un chiffre');

        default:
            break;
    }
}

function checkError(req, res) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
}