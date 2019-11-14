const { QueryFile } = require('pg-promise');
const path = require('path');

module.exports = {
    guests: {
        create: LoadQueryFile('guests/create.sql'),
        delete: LoadQueryFile('guests/delete.sql'),
        getAll: LoadQueryFile('guests/getAll.sql'),
        getOne: LoadQueryFile('guests/getOne.sql'),
        update: LoadQueryFile('guests/update.sql')
    }, 
    misc: {
        confFormData: LoadQueryFile('misc/confFormData.sql'),
        confDisplayData: LoadQueryFile('misc/confDisplayData.sql'),
        getConfName: LoadQueryFile('misc/getConfName.sql')
    }
}
function LoadQueryFile(file) {

    const qf = new QueryFile(path.join(__dirname, file), { minify: true });

    if (qf.error) {
        console.error(qf.error);
    }

    return qf;
}