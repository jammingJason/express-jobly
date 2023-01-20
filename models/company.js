'use strict';

const { compareSync } = require('bcrypt');
const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }
  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    // const getAllData = await db.query(`SELECT c.handle,
    //             c.name,
    //             c.description,
    //             c.num_employees AS "numEmployees",
    //             c.logo_url AS "logoUrl",
    //             j.title,
    //             j.salary,
    //             j.equity
    //      FROM companies AS c
    //      INNER JOIN jobs as j ON c.handle = j.company_handle
    //      ORDER BY c.handle`);

    let newObject = {};
    let compArray = [];
    let jobArray = [];
    compArray = await this.getCompanies();
    for (const comp of compArray) {
      jobArray.push(await this.getJobs(comp.handle));
    }

    return compArray;
  }
  static async getCompanies() {
    let compArray = [];
    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
          FROM companies`
    );
    let jobItem = [];
    for (const comp of companiesRes.rows) {
      compArray.push({
        handle: comp.handle,
        name: comp.name,
        description: comp.description,
        numEmployees: comp.numEmployees,
        logoUrl: comp.logoUrl,
        jobs: await this.getJobs(comp.handle),
      });
      // jobItem.push(await this.getJobs(comp.handle));
      // console.log(jobItem);
    }
    return compArray;
    // companiesRes.rows.forEach(async (comp) => {
    //   compArray.push({
    //     handle: comp.handle,
    //     name: comp.name,
    //     description: comp.description,
    //     numEmployees: comp.numEmployees,
    //     logoUrl: comp.logoUrl,
    //     jobs: this.getJobs(comp.handle),
    //   });
    // });
  }
  static async getJobs(compHandle) {
    const jobs = await db.query(
      `SELECT id, title, salary, equity FROM jobs WHERE company_handle = '${compHandle}'`
    );
    // console.log(jobs.rows);
    return jobs.rows;
  }
  /** Given a company name, minEmployee, and maxEmployee, return data about companies.
   *
   * Returns "companies": [
		{
			"handle",
			"name",
			"description",
			"numEmployees",
			"logoUrl"
		}
  ]
   *
   * Throws BadRequestError if no company name given.
   * Throws BadRequestError if minEmployee is greater than maxEmployee
   **/
  static async filterCompanies(compName, minEmp, maxEmp) {
    let strEmps = '';
    let sql = '';
    let paramArray;
    let compArray = [];

    if (!compName) {
      throw new BadRequestError('Must have a company name');
    }
    compName = `%${compName}%`;
    sql = `SELECT handle,
    name,
    description,
    num_employees AS "numEmployees",
    logo_url AS "logoUrl"
    FROM companies
    WHERE LOWER(name) LIKE $1`;
    paramArray = [compName.toLowerCase()];

    if (minEmp > maxEmp) {
      throw new BadRequestError(
        'Maximum employees cannot be bigger than the Minimum.'
      );
    }
    if (minEmp && maxEmp) {
      sql = `SELECT handle,
      name,
      description,
      num_employees AS "numEmployees",
      logo_url AS "logoUrl"
      FROM companies
      WHERE LOWER(name) LIKE $1 
      AND num_employees >= $2 
      AND num_employees <=$3`;
      paramArray = [compName.toLowerCase(), minEmp, maxEmp];
    }
    if (minEmp && !maxEmp) {
      sql = `SELECT handle,
      name,
      description,
      num_employees AS "numEmployees",
      logo_url AS "logoUrl"
      FROM companies
      WHERE LOWER(name) LIKE $1 
      AND num_employees >= $2`;
      paramArray = [compName.toLowerCase(), minEmp];
    }
    if (!minEmp && maxEmp) {
      sql = `SELECT handle,
      name,
      description,
      num_employees AS "numEmployees",
      logo_url AS "logoUrl"
      FROM companies
      WHERE LOWER(name) LIKE $1  
      AND num_employees <=$2`;
      paramArray = [compName.toLowerCase(), maxEmp];
    }

    const companyRes = await db.query(sql, paramArray);
    for (const comp of companyRes.rows) {
      compArray.push({
        handle: comp.handle,
        name: comp.name,
        description: comp.description,
        numEmployees: comp.numEmployees,
        logoUrl: comp.logoUrl,
        jobs: await this.getJobs(comp.handle),
      });
      // jobItem.push(await this.getJobs(comp.handle));
      // console.log(jobItem);
    }
    const company = compArray;

    if (!company) throw new NotFoundError(`No company: ${compName}`);

    return company;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/
  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: 'num_employees',
      logoUrl: 'logo_url',
    });
    const handleVarIdx = '$' + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
