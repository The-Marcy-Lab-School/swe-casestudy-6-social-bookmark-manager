const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const sql = fs.readFileSync(path.join(__dirname, './init.sql'), 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Tables created successfully.');
    pool.end();
  })
  .catch((err) => {
    console.error('Error creating tables:', err);
    process.exit(1);
  });
