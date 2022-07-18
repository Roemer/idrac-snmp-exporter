const client = require('prom-client');
const SnmpMetricsBase = require('./SnmpMetricsBase.js');

class AmperageProbeMetrics extends SnmpMetricsBase {
    constructor(registry) {
		super(registry);
		
        this.probeReadingMetric = new client.Gauge({
            name: `${this.metricsPrefix}amperage_reading`,
            help: 'Example of a gauge',
            labelNames: ['index', 'type'],
            registers: [this.registry],
        });
		this.probeLocationMetric = new client.Gauge({
            name: `${this.metricsPrefix}amperage_probe_location`,
            help: 'Example of a gauge',
            labelNames: ['index', 'locationName'],
            registers: [this.registry],
        });
		this.probeStatusMetric = new client.Gauge({
            name: `${this.metricsPrefix}amperage_probe_status`,
            help: 'Example of a gauge',
            labelNames: ['index'],
            registers: [this.registry],
        });
    }
    async update(session) {
		// amperageProbeTable
        var tableOid = '1.3.6.1.4.1.674.10892.5.4.600.30';
        var columns = [
            2, // amperageProbeIndex
            5, // amperageProbeStatus
            6, // amperageProbeReading
            7, // amperageProbeType
            8, // amperageProbeLocationName
        ];
        var table = await this.snmpTableColumns(session, tableOid, columns);
        for (var key in table) {
            var entry = table[key];
			
            this.probeReadingMetric.labels({
                index: entry[2],
                type: this.convertEnumToText('AmperageProbeTypeEnum', entry[7], (str) => { return str.replace('amperageProbeType', ''); })
            }).set(entry[6]);
			
			this.probeLocationMetric.labels({
                index: entry[2],
                locationName: entry[8]
            }).set(1);
			
			this.probeStatusMetric.labels({
                index: entry[2]
            }).set(entry[5]);
        }
        return table;
    }
}

module.exports = AmperageProbeMetrics
