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

routes.post("/verify-token", [
    checkBody('email', 'email'),
    checkBody('token', 'notEmpty')
    // length min pour token ?
], (req, res) => {
    let error = checkError(req, res);
    if (error) {
        return error;
    }
    db.guests.getOne({
        email: req.body.email
    })
        .then(data => {
            if (data) {
                if (data.hasValidate) {
                    res.send({ err: req.body.email + " has already registered", success: false, type: "alreadyRegistered" })
                } else {
                    if (data.token === req.body.token) {
                        data.hasValidate = true;
                        db.guests.update(data)
                            .then(updated_data => {
                                if (updated_data == 0) {
                                    res.send({ res: "User not found", success: false, type: "userNotFoundAfterTokenValidation" }).end();
                                } if (updated_data == 1) {
                                    res.send({ res: "User successfully registered", success: true }).end();
                                } else {
                                    res.send({ err: updated_data, type: "updateError", success: false })
                                }
                            })
                            .catch(err => {
                            })
                    } else {
                        res.send({ err: req.body.token + " doesn't match found token", type: "tokenNotMatch", success: false }).end();
                    }
                }
            } else {
                res.send({ err: req.body.email + " not found", type: "emailNotFound", success: false }).end();
            }
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message || err
            }).end();
        })
})

routes.post("/get-thematic-data", [
    checkBody('confId', 'notEmpty'),
    checkBody('confId', 'integer')
    // check integer or numeric ?
], (req, res) => {
    let error = checkError(req, res);
    if (error) {
        return error;
    }
    db.misc.getThematicData(req.body).then(data => {
        console.log("get-thematic-data", data);
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
