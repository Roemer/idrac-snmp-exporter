const client = require('prom-client');
const snmp = require("net-snmp");
const SnmpMetricsBase = require('./SnmpMetricsBase.js');

class ChassisInformationMetrics extends SnmpMetricsBase {
    constructor(registry) {
        super(registry);

        this.systemBiosMetric = new client.Gauge({
            name: this.getMetricName('system_bios'),
            help: 'This attribute defines the short product name of a remote access card.',
            labelNames: ['releaseDate', 'version', 'manufacturer'],
            registers: [this.registry],
        });
    }
    async update(session) {
        // systemBIOSTable
        var tableOid = '1.3.6.1.4.1.674.10892.5.4.300.50';
        var columns = [
            2, // systemBIOSIndex
            7, // systemBIOSReleaseDateName
            8, // systemBIOSVersionName
            11, // systemBIOSManufacturerName
        ];
        var table = await this.snmpTableColumns(session, tableOid, columns);
        for (var key in table) {
            var entry = table[key];

            this.systemBiosMetric.labels({
                releaseDate: entry[7],
                version: entry[8],
                manufacturer: entry[11],
            }).set(1);
        }
    }
}

module.exports = ChassisInformationMetrics;
