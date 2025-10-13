const express = require('express');
const router = express.Router();
const plans = require('./plans');
const users = require('./users');
const subs = require('./subscriptions');
const payments = require('./payments');

router.use('/plans', plans);
router.use('/users', users);
router.use('/subscriptions', subs);
router.use('/payments', payments);

module.exports = router;
