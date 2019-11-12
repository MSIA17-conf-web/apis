const routes = require('express').Router(),
    { db } = require('../db'),
    { check, validationResult } = require('express-validator');

routes.post('/create', [
    checkBody('fName', 'notEmpty'),
    checkBody('fName', 'length', 2),
    checkBody('lName', 'notEmpty'),
    checkBody('lName', 'length', 2),
    checkBody('email', 'email'),
    checkBody('company', 'notEmpty'),
    checkBody('company', 'length', 2),
    checkBody('position', 'notEmpty'),
    checkBody('position', 'length', 2),
    checkBody('vehicle', 'boolean'),
    checkBody('hasValidate', 'boolean'),
    checkBody('token', 'empty'),
    checkBody('conferences', 'arrayNotEmpty')
], (req, res) => {
    let error = checkError(req, res);
    if(error) { 
        return error;
    }
    db.guests.create(req.body)
        .then(data => {
            res.send({ res: data }).end();
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message,
                detail: err.detail
            }).end();
        })
})

routes.delete('/delete', [
    checkBody('email', 'email')
], (req, res) => {
    let error = checkError(req, res);
    if(error) { 
        return error;
    }
    db.guests.delete(req.body)
        .then(data => {
            if (data == 0) {
                res.send({ res: 'User not found', success: false }).end();
            } if (data == 1) {
                res.send({ res: 'User deleted', success: true }).end();
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

routes.get('/get-all', (req, res) => {
    db.guests.getAll()
        .then(data => {
            if (data) {
                res.send(data).end();
            } else {
                res.send({ err: 'No user found.' });
            }
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message || err
            }).end();
        })
})

routes.post('/get-one', [
    checkBody('email', 'email')
], (req, res) => {
    let error = checkError(req, res);
    if(error) { 
        return error;
    }

    db.guests.getOne(req.body)
        .then(data => {
            if (data) {
                res.send(data).end();
            } else {
                res.send({ err: 'User with email : ' + req.body.email + ' not found' });
            }
        })
        .catch(err => {
            console.log(err);

            res.send({
                err: err.message || err
            }).end();
        })
})

routes.put('/update', [
    checkBody('fName', 'notEmpty'),
    checkBody('fName', 'length', 2),
    checkBody('lName', 'notEmpty'),
    checkBody('lName', 'length', 2),
    checkBody('email', 'email'),
    checkBody('company', 'notEmpty'),
    checkBody('company', 'length', 2),
    checkBody('position', 'notEmpty'),
    checkBody('position', 'length', 2),
    checkBody('vehicle', 'boolean'),
    checkBody('hasValidate', 'boolean'),
    checkBody('token', 'notEmpty'),
    checkBody('conferences', 'arrayNotEmpty')
], (req, res) => {
    db.guests.update(req.body)
        .then(data => {
            if (data == 0) {
                res.send({ res: 'User not found', success: false }).end();
            } if (data == 1) {
                res.send({ res: 'User updated', success: true }).end();
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

function checkBody(attribut, method, value) {
    switch (method) {
        case 'notEmpty':
            return check(attribut).not().isEmpty().withMessage('Ce champ est obligatoire');

        case 'empty':
            return check(attribut).isEmpty().withMessage('Ce champ doit être vide');

        case 'length':
            return check(attribut).isLength({ min: 2 }).withMessage('Ce champ doit contenir au minimu ' + value + ' caractères');

        case 'arrayNotEmpty':
            return check(attribut).isArray().not().isEmpty().withMessage('Ce tableau ne doit pas être vide');

        case 'email':
            return check(attribut).not().isEmpty().withMessage('Ce champ est obligatoire').isEmail();

        case 'boolean':
            return check(attribut).isBoolean();

        default:
            break;
    }
}

function checkError(req, res){
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
}
