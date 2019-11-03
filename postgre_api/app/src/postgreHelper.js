const { Pool } = require('pg');

let pool = null;


let postgreHelper = {
    initConnection: () => {
        return new Promise((resolve, reject) => {
            console.log("Connecting to postgre database...");

            pool = new Pool({
                user: 'msia17',
                host: 'postgres',
                database: 'msia17conferences',
                password: 'msia17',
                port: 5432,
            });
            pool
                .query('SELECT NOW()')
                .then(res => {
                    console.log(res.rows[0].now)
                    resolve('Connection to postgre OK');
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    getAll: body => {
        return new Promise((resolve, reject) => {
            const sqlQuery = 'SELECT * FROM ' + body.table + ' ORDER BY "' + body.orderBy + '" ASC';

            pool.query(sqlQuery, (err, results) => {
                if (err) {
                    reject({ err: err });
                }
                console.log("Récupération de la liste des personnes inscrites");

                resolve({ result: results.rows });
            });

        });
    },
    createGuest: body => {
        return new Promise((resolve, reject) => {
            let newId;

            pool.query('SELECT MAX("idGuest") FROM ' + body.table, (err, results) => {
                if (err) {
                    reject({ err: err });
                }
                console.log("Incrémentation du dernier identifiant");
                console.log("result", results.rows[0].max);

                newId = results.rows[0].max + 1;
                if (newId) {
                    const sqlQuery = 'INSERT INTO ' + body.table + ' ("idGuest", "lastName", "firstName", "enterpriseName", "email") '
                        + 'VALUES (' + newId + ', \'' + body.lastName + '\', \'' + body.firstName + '\', \'' + body.enterpriseName + '\''
                        + ', \'' + body.email + '\');';

                    pool.query(sqlQuery, (err, results) => {
                        if (err) {
                            reject({ err: err });
                        }
                        console.log("La réservation a bien été enregistré pour l'utilisateur " + body.lastName);

                        resolve({ result: true });
                    });
                } else {
                    reject({ err: "Impossible de récupérer le nouvel identifiant" });
                }
            });
        });
    },
    updateGuest: body => {
        return new Promise((resolve, reject) => {

            let id = body.id, lastName = body.lastName, firstName = body.firstName, enterpriseName = body.enterpriseName, email = body.email;


            // faire une requete entiere et non avec des if
            if (lastName && firstName && enterpriseName && email) {
                let sqlQuery = 'UPDATE ' + body.table + ' SET "lastName" = \'' + lastName + '\', "firstName" = \'' + firstName + '\', '
                    + '"enterpriseName" = \'' + enterpriseName + '\', "email" = \'' + email + '\' WHERE "idGuest" = ' + id;

                console.log("sqlQuery", sqlQuery);

                pool.query(sqlQuery, (err, results) => {
                    console.log("test");

                    if (err) {
                        reject({ err: err });
                    }
                    console.log("L'utilisateur avec l'identifiant " + id + " a bien été modifié");

                    resolve({ result: true });
                });
            } else {
                reject({ err: "Tous les champs sont obligatoires" });
            }
        });
    },
    removeGuest: body => {
        return new Promise((resolve, reject) => {
            const sqlQuery = 'DELETE FROM ' + body.table + ' WHERE "idGuest" = ' + body.id;

            pool.query(sqlQuery, (err, results) => {
                if (err) {
                    reject({ err: err });
                }
                console.log("L'utilisateur avec l'edentifiant " + body.id + " a bien été supprimé");

                resolve({ result: true });
            });
        });
    }

}

module.exports = postgreHelper;