const { DatabaseSync } = require('node:sqlite')
const path = require('node:path')

const db = new DatabaseSync(path.join(__dirname, '..', '..', 'detectives3000.db'))

module.exports = db
