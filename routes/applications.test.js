'use strict';

const request = require('supertest');

const db = require('../db');
const app = require('../app');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /applications */

describe('GET /users/:username/jobs/:id', function () {
  test('ok for anon', async function () {
    const resp = await request(app).get('/users/:c1/jobs/:1');
    expect(resp.body).toEqual({
      applications: [
        {
          username: 'c1',
          job_id: 1,
        },
      ],
    });
  });
});
