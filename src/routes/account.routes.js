const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { create, getMine, enquireName } = require('../controllers/account.controller');



router.post('/', auth, create);
router.get('/me', auth, getMine);
router.get('/name-enquiry/:accountNumber', auth, enquireName);

module.exports = router;