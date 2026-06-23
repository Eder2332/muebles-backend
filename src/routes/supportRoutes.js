const express = require('express');

const router = express.Router();
const supportController = require('../controllers/supportController');
const auth = require('../middlewares/auth');

router.post('/report', auth, supportController.sendSupportReport);

module.exports = router;
