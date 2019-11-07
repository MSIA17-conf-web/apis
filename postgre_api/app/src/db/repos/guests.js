const sql = require('../sql').guests

class GuestsRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }
    async create(data) {
        return this.db.result(sql.create, data, r => r.rowCount);
    }

    async update(data) {
        return this.db.result(sql.update, data, r => r.rowCount);
    }

    async delete(data) {
        return this.db.result(sql.delete, data, r => r.rowCount);
    }

    async getAll() {
        return this.db.manyOrNone(sql.getAll)
    }

    async getOne(data) {
        return this.db.oneOrNone(sql.getOne, data);
    }
}

module.exports = GuestsRepository;