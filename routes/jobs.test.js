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

/************************************** POST /jobs */

describe('POST /jobs', function () {
  const newjob = {
    title: 'Janitor',
    salary: 45000,
    equity: 0.01,
    company_handle: 'c1',
  };

  test('ok for users', async function () {
    const resp = await request(app)
      .post('/jobs')
      .send(newjob)
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        title: 'Janitor',
        salary: 45000,
        equity: '0.01',
        company_handle: 'c1',
      },
    });
  });

  test('bad request with missing data', async function () {
    const resp = await request(app)
      .post('/jobs')
      .send({
        title: 'new',
        equity: 10,
      })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe('GET /jobs', function () {
  test('ok for anon', async function () {
    const resp = await request(app).get('/jobs');
    expect(resp.body).toEqual({
      jobs: [
        {
          title: 'Production Manager',
          salary: 185000,
          equity: '0.85',
          company_handle: 'c1',
        },
      ],
    });
  });

  test('works: ok for filter', async function () {
    const strTitle = 'Prod';
    const strMinSalary = 180000;
    const strEquity = true;
    const resp = await request(app).get(
      `/jobs?title=${strTitle}&minSalary=${strMinSalary}&equity=${strEquity}`
    );
    expect(resp.body).toEqual({
      jobs: [
        {
          title: 'Production Manager',
          salary: 185000,
          equity: '0.85',
          company_handle: 'c1',
        },
      ],
    });
  });
  test('works: ok for filter with no Equity', async function () {
    const strTitle = 'Prod';
    const strMinSalary = 180000;
    const strEquity = false;
    const resp = await request(app).get(
      `/jobs?title=${strTitle}&minSalary=${strMinSalary}&equity=${strEquity}`
    );
    expect(resp.body).toEqual({
      jobs: [
        {
          company_handle: 'c1',
          equity: '0.85',
          salary: 185000,
          title: 'Production Manager',
        },
      ],
    });
  });

  test('fails: test next() handler', async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query('DROP TABLE jobs CASCADE');
    const resp = await request(app)
      .get('/jobs')
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:handle */

describe('GET /jobs/:id', function () {
  test('works for anon', async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        title: 'Production Manager',
        salary: 185000,
        equity: '0.85',
        company_handle: 'c1',
      },
    });
  });

  test('works for anon: job w/o jobs', async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        title: 'Production Manager',
        salary: 185000,
        equity: '0.85',
        company_handle: 'c1',
      },
    });
  });

  test('not found for no such job', async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:handle */

describe('PATCH /jobs/:id', function () {
  test('works for users', async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: 'Production Supervisor',
        salary: 185000,
        equity: 0.85,
        company_handle: 'c1',
      })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        title: 'Production Supervisor',
        salary: 185000,
        equity: '0.85',
        company_handle: 'c1',
      },
    });
  });

  test('unauth for anon', async function () {
    const resp = await request(app).patch(`/jobs/c1`).send({
      name: 'C1-new',
    });
    expect(resp.statusCode).toEqual(401);
  });

  // test('not found on no such job', async function () {
  //   const resp = await request(app)
  //     .patch(`/jobs/0`)
  //     .send({
  //       title: 'new nope',
  //     })
  //     .set('authorization', `Bearer ${u1Token}`);
  //   expect(resp.statusCode).toEqual(404);
  // });

  test('bad request on handle change attempt', async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        company_handle: 'c1',
      })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test('bad request on invalid data', async function () {
    const resp = await request(app)
      .patch(`/jobs/c1`)
      .send({
        salary: -1,
      })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:handle */

describe('DELETE /jobs/:id', function () {
  test('works for users', async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: '1' });
  });

  test('unauth for anon', async function () {
    const resp = await request(app).delete(`/jobs/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test('not found for no such job', async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
