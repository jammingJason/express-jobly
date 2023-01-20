'use strict';

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { UnauthorizedError } = require('../expressError');

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    console.log(`THIS IS THE PAYLOAD => ${req.body.user.isAdmin}`.green);
    const payload = jwt.verify(req.body.token, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (error) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    const e = new UnauthorizedError('Unauthorized');
    return next(e);
  } else {
    return next();
  }
}

function ensureAdmin(req, res, next) {
  if (!req.user || req.body.user.isAdmin != false) {
    throw new ExpressError('Must be an admin to access this page.', 401);
  }
  return next();
}
module.exports = { authenticateJWT, ensureLoggedIn, ensureAdmin };
