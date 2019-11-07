const { QueryFile } = require('pg-promise');
const path = require('path');

module.exports = {
    guests: {

    }, 
    misc: {
        confFormData: LoadQueryFile('./misc/confFormData.sql'),
        confDisplayData: LoadQueryFile('./misc/confDisplayData.sql')
    }
}
function LoadQueryFile(file) {

    const qf = new QueryFile(path.join(__dirname, file), { minify: true });

    if (qf.error) {
        console.error(qf.error);
    }

    return qf;
}