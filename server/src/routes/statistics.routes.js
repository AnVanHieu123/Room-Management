const express = require('express');
const router = express.Router();
const StatisticsController = require('../controller/statistics.controller');
const { asyncHandler, authAdmin } = require('../auth/checkAuth');

router.get('/', authAdmin, asyncHandler(StatisticsController.getStatistics));

module.exports = router;
