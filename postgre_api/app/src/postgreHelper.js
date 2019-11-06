require("dotenv").config();

const pgp = require('pg-promise')({
    error(error, e) {
        if (e.cn) {
            console.log('CN:', e.cn);
            console.log('EVENT:', error.message || error);
        }
    }
}),
    path = require('path');

const cn = {
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port
};

var db = pgp(cn);

module.exports = {
    initConnection: () => {
        return new Promise((resolve, reject) => {
            db.proc('version')
                .then(data => {
                    resolve("Connection to db ok : " + data.version)
                })
                .catch(err => {

                    reject(err)
                })
        });
    },
    execFromFile: (body) => {
        return new Promise((resolve, reject) => {
            db.any(loadQueryFromFile(body.fileName), body.options)
                .then(res => {
                    console.log("Got result for",body.fileName);
                    console.log(res);
                    
                    resolve(res);
                })
                .catch(err => {
                    console.log("Got error for",body.fileName);

                    reject(err);
                })
        })
    }
}

function loadQueryFromFile(file) {
    const fullPath = path.join(__dirname, "queries", file + ".sql");
    return new pgp.QueryFile(fullPath , { minify: true });
}