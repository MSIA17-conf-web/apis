const sql = require('../sql').misc

class MiscRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }
    async getConfFormData() {
        return this.db.any(sql.confFormData);
    }

    async getConfDisplayData() {
        return this.db.any(sql.confDisplayData);
    }
}

module.exports = MiscRepository;