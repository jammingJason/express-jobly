'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * */

  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all Jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobs = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           ORDER BY company_handle`
    );
    return jobs.rows;
  }

  /** Given a job title, minSalary, and equity, return data about jobs.
   *
   * Returns "jobs": [
		{
			title, salary, equity, company_handle
		}
  ]
   *
   **/
  static async filterJobs(title, minSalary, equity) {
    let sql;
    // console.log(`THIS IS EQUITY ================>  ${equity}`);
    let paramArray;

    if (!title) {
      title = '%';
    } else {
      title = '%' + title + '%';
    }
    if (!minSalary) {
      minSalary = 0;
    }
    if (equity === 'true') {
      sql = `SELECT title, salary, equity, company_handle 
      FROM jobs 
      WHERE LOWER(title) LIKE $1 AND salary >= $2 AND equity !=$3`;
      paramArray = [title.toLowerCase(), minSalary, 0];
      console.log(paramArray);
    } else {
      sql = `SELECT title, salary, equity, company_handle 
      FROM jobs 
      WHERE LOWER(title) LIKE $1 AND salary >= $2`;
      paramArray = [title.toLowerCase(), minSalary];
    }
    const jobRes = await db.query(sql, paramArray);
    const jobs = jobRes.rows;

    if (!jobs) throw new NotFoundError(`No job found`);

    return jobs;
  }

  /** Given a job id, return data about job.
   *
   * Returns { title, salary, equity, company_handle }
   *   where jobs is [{ title, salary, equity, company_handle}, ...]
   *
   * Throws NotFoundError if not found.
   **/
  static async get(id) {
    const jobRes = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const querySql = `UPDATE jobs 
                      SET title='${data.title}',
                      salary='${data.salary}',
                      equity='${data.equity}',
                      company_handle='${data.company_handle}' 
                      WHERE id = $1 
                      RETURNING title, salary, equity, company_handle`;
    const result = await db.query(querySql, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);
  }
}

module.exports = Job;
