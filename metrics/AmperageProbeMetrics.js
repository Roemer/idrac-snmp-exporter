const client = require('prom-client');
const SnmpMetricsBase = require('./SnmpMetricsBase.js');

class AmperageProbeMetrics extends SnmpMetricsBase {
    constructor(registry) {
        super(registry);

        this.probeReadingMetric = new client.Gauge({
            name: this.getMetricName('amperage_probe_reading'),
            help: 'This attribute defines the reading for an amperage probe.',
            labelNames: ['index', 'type'],
            registers: [this.registry],
        });
        this.probeLocationMetric = new client.Gauge({
            name: this.getMetricName('amperage_probe_location'),
            help: 'This attribute defines the location of the amperage probe.',
            labelNames: ['index', 'locationName'],
            registers: [this.registry],
        });
        this.probeStatusMetric = new client.Gauge({
            name: this.getMetricName('amperage_probe_status'),
            help: 'This attribute defines the probe status of the amperage probe.',
            labelNames: ['index', 'statusName'],
            registers: [this.registry],
        });
        this.probeStatusCodeMetric = new client.Gauge({
            name: this.getMetricName('amperage_probe_status_code'),
            help: 'This attribute defines the probe status (code) of the amperage probe.',
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

            this.setProbeReadingMetric(entry);

            this.probeLocationMetric.labels({
                index: entry[2],
                locationName: entry[8]
            }).set(1);

            this.setStateSetMetricValues('StatusProbeEnum', (key, value) => {
                this.probeStatusMetric.labels({
                    index: entry[2],
                    statusName: value
                }).set(entry[5] == key ? 1 : 0);
            });

            this.probeStatusCodeMetric.labels({
                index: entry[2]
            }).set(entry[5]);
        }
    }
    setProbeReadingMetric(entry) {
        var type = this.convertEnumToText('AmperageProbeTypeEnum', entry[7], (str) => str.replace('amperageProbeType', ''));
        var value = entry[6];
        if (type === 'IsPowerSupplyAmps' || type === 'IsSystemAmps') {
            // Amps are in tenth of amps so fix this
            value = value / 10;
        }
        this.probeReadingMetric.labels({
            index: entry[2],
            type: type
        }).set(value);
    }
}

module.exports = AmperageProbeMetrics;
