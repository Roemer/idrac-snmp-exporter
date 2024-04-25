const client = require('prom-client');
const SnmpMetricsBase = require('./SnmpMetricsBase.js');

class AmperageProbeMetrics extends SnmpMetricsBase {
    constructor(registry) {
        super(registry);
        
        this.probeReadingMetric = this.createGauge({
            name: 'amperage_probe_reading',
            help: 'This attribute defines the reading for an amperage probe.',
            labelNames: ['type'],
            withIndex: true
        });
        this.probeLocationMetric = this.createGauge({
            name: 'amperage_probe_location',
            help: 'This attribute defines the location of the amperage probe.',
            labelNames: ['locationName'],
            withIndex: true
        });
        if (this.statusAsEnum) {
            this.probeStatusMetric = this.createGauge({
                name: 'amperage_probe_status',
                help: 'This attribute defines the probe status of the amperage probe.',
                labelNames: ['statusName'],
                withIndex: true
            });
        }
        if (this.statusAsNumber) {
            this.probeStatusCodeMetric = this.createGauge({
                name: 'amperage_probe_status_code',
                help: 'This attribute defines the probe status (code) of the amperage probe.',
                labelNames: [],
                withIndex: true
            });
        }
    }
    async update(session) {
        // amperageProbeTable
        var tableOid = '1.3.6.1.4.1.674.10892.5.4.600.30';
        
        var columns = [];
        this.addToArray(columns, 1, this.includeChassisIndex); // amperageProbechassisIndex
        columns.push(2); // amperageProbeIndex
        this.addToArray(columns, 5, this.statusAsEnum || this.statusAsNumber); // amperageProbeStatus
        columns.push(6); // amperageProbeReading
        columns.push(7); // amperageProbeType
        columns.push(8); // amperageProbeLocationName

        var table = await this.snmpTableColumns(session, tableOid, columns);
        for (var key in table) {
            var entry = table[key];

            this.setProbeReadingMetric(entry);

            this.setGaugeWithIndex(this.probeLocationMetric, 1, entry[1], entry[2], {
                locationName: entry[8]
            });

            this.setStateSetMetricValues('StatusProbeEnum', (key, value) => {
                this.setGaugeWithIndex(this.probeStatusMetric, entry[5] == key ? 1 : 0, entry[1], entry[2], {
                    statusName: value
                });
            });
            
            this.setGaugeWithIndex(this.probeStatusCodeMetric, entry[5], entry[1], entry[2]);
        }
    }
    setProbeReadingMetric(entry) {
        if (!entry[6]) {
            // Do not set a value if it is not included (eg. when it is turned off)
            return;
        }
        var type = this.convertEnumToText('AmperageProbeTypeEnum', entry[7], (str) => str.replace('amperageProbeType', ''));
        var value = entry[6];
        if (type === 'IsPowerSupplyAmps' || type === 'IsSystemAmps') {
            // Amps are in tenth of amps so fix this
            value = value / 10;
        }
        this.setGaugeWithIndex(this.probeReadingMetric, value, entry[1], entry[2], {
            type: type
        });
    }
}

module.exports = AmperageProbeMetrics;
