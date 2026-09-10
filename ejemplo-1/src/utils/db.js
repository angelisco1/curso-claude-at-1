const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const db = new DatabaseSync(path.join(__dirname, '..', '..', 'informes.db'));

module.exports = db;
