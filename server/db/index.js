const { Pool } = require('pg')

const pool = new Pool ({
  user: 'justincase',
  host: 'local socket',
  database: 'QA',
  port: 5432,
})

module.exports = pool;
