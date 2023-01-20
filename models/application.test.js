'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Application = require('./application.js');
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

describe('create', function () {
  const newApplication = {
    username: 'u1',
    job_id: 1,
  };

  test('works', async function () {
    let application = await Application.create(newApplication);
    expect(application).toEqual(newApplication);

    const result = await db.query(
      `SELECT username, job_id as jobId
      FROM applications 
      WHERE jobId=$1 AND username=$2`,
      [1, 'u1']
    );
    expect(result.rows).toEqual([
      {
        username: 'u1',
        job_id: 1,
      },
    ]);
  });
});
