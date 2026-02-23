const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/catalog', reportController.generateCatalog);

module.exports = router;
