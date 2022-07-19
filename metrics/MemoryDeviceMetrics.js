const client = require('prom-client');
const SnmpMetricsBase = require('./SnmpMetricsBase.js');

class MemoryDeviceMetrics extends SnmpMetricsBase {
    constructor(registry) {
        super(registry);

    }
    async update(session) {

    }
}

module.exports = MemoryDeviceMetrics;
