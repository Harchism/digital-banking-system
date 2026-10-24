const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { transfer, status, history } = require('../controllers/transaction.controller');


router.post('/transfer', auth, transfer);
router.get('/status/:reference', auth, status);
router.get('/history', auth, history);

module.exports = router;