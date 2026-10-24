const express = require('express');
const router = express.Router();
const {onboard} = require('../controllers/onboarding.controller');

router.post('/onboard', onboard);

module.exports = router;