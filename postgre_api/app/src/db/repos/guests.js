const sql = require('../sql').guests

class MiscRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }
    async testGuests() {
        return this.db.proc('version');
    }
}

module.exports = MiscRepository;