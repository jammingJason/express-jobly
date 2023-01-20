'use strict';

/** Shared config for application; can be required many places. */

require('dotenv').config();
require('colors');

const SECRET_KEY = process.env.SECRET_KEY || 'secret-dev';
const DB_USER = process.env.DB_USER;
const DB_PW = process.env.DB_PW;
const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === 'test'
    ? 'jobly_test'
    : process.env.DB_URI || 'jobly';
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === 'test' ? 1 : 12;

console.log('Jobly Config:'.green);
console.log('SECRET_KEY:'.yellow, SECRET_KEY);
console.log('PORT:'.yellow, DB_PORT.toString());
console.log('BCRYPT_WORK_FACTOR'.yellow, BCRYPT_WORK_FACTOR);
console.log('Database:'.yellow, getDatabaseUri());
console.log('---');

module.exports = {
  SECRET_KEY,
  DB_HOST,
  DB_PW,
  DB_USER,
  DB_PORT,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
