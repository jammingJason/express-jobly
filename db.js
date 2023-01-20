'use strict';
/** Database setup for jobly. */
const { Client } = require('pg');
const {
  getDatabaseUri,
  DB_HOST,
  DB_PORT,
  DB_PW,
  DB_URI,
  DB_USER,
} = require('./config');

let db;

if (process.env.NODE_ENV === 'production') {
  db = new Client({
    user: DB_USER,
    password: DB_PW,
    database: getDatabaseUri(),
    host: DB_HOST,
    port: DB_PORT,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    user: DB_USER,
    password: DB_PW,
    database: getDatabaseUri(),
    host: DB_HOST,
    port: DB_PORT,
  });
}

db.connect();

module.exports = db;
