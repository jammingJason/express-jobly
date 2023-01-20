'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./job.js');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
// console.log(`THIS IS THE SELECT STATEMENT WITH ID => ${1}`);
describe('create', function () {
  const newJob = {
    title: 'Professor',
    salary: 73500,
    equity: 0.125,
    company_handle: 'c1',
  };

  test('works', async function () {
    let job = await Job.create({
      title: 'Supervisor',
      salary: 55000,
      equity: 0.2,
      company_handle: 'c1',
    });
    expect(job).toEqual({
      title: 'Supervisor',
      salary: 55000,
      equity: '0.2',
      company_handle: 'c1',
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM companies
           WHERE id = ${job.id}`
    );
    expect(result.rows).toEqual([
      {
        title: 'Professor',
        salary: 73500,
        equity: '0.125',
        company_handle: 'c1',
      },
    ]);
  });
});

/************************************** findAll */

describe('findAll', function () {
  test('works: no filter', async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: 'Production Manager',
        equity: '0.85',
        salary: 185000,
        company_handle: 'c1',
      },
    ]);
  });
});

// ************************************** filter
// describe('filter', function () {
//   test('works: with filter w/ min and max employee', async function () {
//     const name = 'C';
//     const minEmployees = 1;
//     const maxEmployees = 2;
//     let companies = await Company.filterCompanies(
//       name,
//       minEmployees,
//       maxEmployees
//     );
//     expect(companies).toEqual([
//       {
//         handle: 'c1',
//         name: 'C1',
//         description: 'Desc1',
//         numEmployees: 1,
//         logoUrl: 'http://c1.img',
//       },
//       {
//         handle: 'c2',
//         name: 'C2',
//         description: 'Desc2',
//         numEmployees: 2,
//         logoUrl: 'http://c2.img',
//       },
//     ]);
//   });
//   test('works: with filter w/ min and not max employee', async function () {
//     const name = 'C';
//     const minEmployees = 1;
//     // No max employee
//     // const maxEmployees = '';
//     let companies = await Company.filterCompanies(
//       name,
//       minEmployees
//       // maxEmployees
//     );
//     expect(companies).toEqual([
//       {
//         handle: 'c1',
//         name: 'C1',
//         description: 'Desc1',
//         numEmployees: 1,
//         logoUrl: 'http://c1.img',
//       },
//       {
//         handle: 'c2',
//         name: 'C2',
//         description: 'Desc2',
//         numEmployees: 2,
//         logoUrl: 'http://c2.img',
//       },
//       {
//         handle: 'c3',
//         name: 'C3',
//         description: 'Desc3',
//         numEmployees: 3,
//         logoUrl: 'http://c3.img',
//       },
//     ]);
//   });
//   test('works: with filter w/ max and not min employee', async function () {
//     const name = 'C';
//     // No min employee
//     const minEmployees = '';
//     const maxEmployees = 2;
//     let companies = await Company.filterCompanies(
//       name,
//       minEmployees,
//       maxEmployees
//     );
//     expect(companies).toEqual([
//       {
//         handle: 'c1',
//         name: 'C1',
//         description: 'Desc1',
//         numEmployees: 1,
//         logoUrl: 'http://c1.img',
//       },
//       {
//         handle: 'c2',
//         name: 'C2',
//         description: 'Desc2',
//         numEmployees: 2,
//         logoUrl: 'http://c2.img',
//       },
//     ]);
//   });
// });

/************************************** get */

describe('get', function () {
  test('works', async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      comphandle: 'c1',
      equity: '0.85',
      salary: 185000,
      title: 'Production Manager',
    });
  });

  test('not found if no such job', async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe('update', function () {
  const updateData = {
    title: 'IT Supervisor',
    salary: 65000,
    equity: 0.3,
    company_handle: 'c1',
  };

  test('works', async function () {
    let job = await Job.update(1, {
      title: 'Janitor',
      salary: 45000,
      equity: 0.01,
      company_handle: 'c1',
    });
    expect(job).toEqual({
      title: 'Janitor',
      salary: 45000,
      equity: '0.01',
      company_handle: 'c1',
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle as compHandle
           FROM companies
           WHERE id = ${1}`
    );
    expect(result.rows).toEqual([
      {
        title: 'IT Supervisor',
        salary: 65000,
        equity: '0.3',
        compHandle: 'c1',
      },
    ]);
  });

  test('not found if no such job', async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test('bad request with no data', async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe('remove', function () {
  test('works', async function () {
    await Job.remove(1);
    const res = await db.query('SELECT id FROM jobs WHERE id=1');
    expect(res.rows.length).toEqual(0);
  });

  test('not found if no such company', async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
