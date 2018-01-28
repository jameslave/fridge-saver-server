// Set up database connection

const config = require('../config');
const sql = require('mysql2/promise');

require('./init');

module.exports = () => sql.createConnection(config.DB_OPTIONS);
