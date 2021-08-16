const { Pool } = require('pg')

const pool = new Pool ({
  "user": 'justincase',
  "host": '127.0.0.1',
  "database": 'QA',
  "port": 5432,
})

module.exports = pool;
