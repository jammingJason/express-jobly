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
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, '').trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  try {
    console.log(`THIS IS THE LOGGED IN FUNCTION`);
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be who they are supposed to be
 *  and if they are an Admin or not.
 *
 * If not, raises Unauthorized.
 */
function ensureWhosWho(req, res, next) {
  try {
    console.log(`THIS IS THE PARAM => ${req.params.username}`);
    if (
      res.locals.user.username === req.params.username ||
      res.locals.user.isAdmin === true
    ) {
      return next();
    } else {
      throw new UnauthorizedError();
    }
    // return next();
  } catch (error) {
    return next(new UnauthorizedError());
  }
}

/** Middleware to use when they must be an Admin.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user.username || res.locals.user.isAdmin === false) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (error) {
    return next(new UnauthorizedError());
  }
}
module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureWhosWho,
};
