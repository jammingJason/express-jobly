const { BadRequestError } = require('../expressError');

// THIS NEEDS SOME GREAT DOCUMENTATION.

// Takes the partial JSON data and
// creates a SQL-injection-safe partial SQL Statement
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //  Checks to see if there is any data to update.
  // If not, throws a 'bad request' error
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError('No data');

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']

  //  Maps each column that needs to be included in the new statement
  //  Takes the column name and adds $ and the index of that item in the array plus 1.
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );
  //  Returns an Object with the setCols and values information
  return {
    setCols: cols.join(', '),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
