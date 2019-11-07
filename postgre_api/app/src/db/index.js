require("dotenv").config();

const { Misc, Guests } = require('./repos')
const pgp = require('pg-promise')({
    extend(obj, dc) {
        obj.misc = new Misc(obj, pgp),
        obj.guests = new Guests(obj, pgp)
    }, 
    error(error, e) {
        if (e.cn) {
            console.log('CN:', e.cn);
            console.log('EVENT:', error.message || error);
        }
    }
}),
    cn = {
        user: process.env.user,
        host: process.env.host,
        database: process.env.database,
        password: process.env.password,
        port: process.env.port
    },
    db = pgp(cn);


module.exports = { pgp, db };