const express = require('express');

const router = express.Router();
const supportController = require('../controllers/supportController');

router.post('/report', supportController.sendSupportReport);

module.exports = router;
