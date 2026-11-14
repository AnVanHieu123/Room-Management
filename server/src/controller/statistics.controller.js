const StatisticsService = require('../services/statistics.service');
const { OK } = require('../core/success.response');

class StatisticsController {
    async getStatistics(req, res) {
        const statistics = await StatisticsService.getStatistics();
        new OK({ message: 'success', metadata: statistics }).send(res);
    }
}

module.exports = new StatisticsController();
