const jwt = require('jsonwebtoken');
// const { createToken } = require("./tokens");
const { SECRET_KEY } = require('../config');
const spu = require('./sql');

describe('sqlForPartialUpdate', function () {
  test('works: replace json with SQL statement', () => {
    const getNewInfo = spu.sqlForPartialUpdate(
      { firstName: 'Aliya', age: 32 },
      {
        firstName: 'first_name',
        age: 'age',
      }
    );
    expect(getNewInfo.setCols).toEqual(`"first_name"=$1, "age"=$2`);
  });
});
