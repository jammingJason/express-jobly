// /users/:username/jobs/:id

'use strict';

/** Routes for companies. */

const jsonschema = require('jsonschema');
const express = require('express');

const { BadRequestError } = require('../expressError');
const { ensureWhosWho, ensureAdmin } = require('../middleware/auth');
const Application = require('../models/application');

const applicationNewSchema = require('../schemas/applicationNew.json');
// const applicationUpdateSchema = require('../schemas/applicationUpdate.json');
// const applicationFilterSchema = require('../schemas/applicationFilter.json');

const router = new express.Router();

/** POST /users/:username/jobs/:id
 *
 * user must include { username, ID in the route }
 *
 *
 * Authorization required: Current logged in user or Admin
 */
router.post(
  '/users/:username/jobs/:id',
  ensureWhosWho,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.params, applicationNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      await Application.create(req.params);

      return res.status(201).json({
        applied: id,
      });
    } catch (err) {
      return next(err);
    }
  }
);
