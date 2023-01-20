'use strict';

const { compareSync } = require('bcrypt');
const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for applications. */

class Application {
  /** Create an application (from data), update db, return new application data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if application already in database.
   * */

  static async create(username, job_id) {
    console.log(`THIS IS THE CREATE APPLICATION USERNAME =====>  ${username}`);
    const duplicateCheck = await db.query(
      `SELECT username, job_id
           FROM applications
           WHERE username= $1 AND job_id= $2`,
      [username, job_id]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate application`);

    const result = await db.query(
      `INSERT INTO applications
           (username, job_id)
           VALUES ($1, $2)
           RETURNING username, job_id AS jobId`,
      [username, job_id]
    );
    const application = result.rows[0];

    return application;
  }
}

module.exports = Application;
