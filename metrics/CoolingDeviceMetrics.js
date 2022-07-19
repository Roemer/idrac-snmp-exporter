const client = require('prom-client');
const SnmpMetricsBase = require('./SnmpMetricsBase.js');

class CoolingDeviceMetrics extends SnmpMetricsBase {
    constructor(registry) {
        super(registry);

        this.coolingDeviceReadingMetric = new client.Gauge({
            name: this.getMetricName('cooling_device_reading'),
            help: 'This attribute defines the reading for a cooling device.',
            labelNames: ['index', 'type', 'subtype'],
            registers: [this.registry],
        });
        this.coolingDeviceLocationMetric = new client.Gauge({
            name: this.getMetricName('cooling_device_location'),
            help: 'This attribute defines the location of the cooling device.',
            labelNames: ['index', 'locationName'],
            registers: [this.registry],
        });
        this.coolingDeviceFqddMetric = new client.Gauge({
            name: this.getMetricName('cooling_device_fqdd'),
            help: 'This attribute defines the FQDD of the cooling device.',
            labelNames: ['index', 'fqdd'],
            registers: [this.registry],
        });
        this.coolingDeviceStatusMetric = new client.Gauge({
            name: this.getMetricName('cooling_device_status'),
            help: 'This attribute defines the status of the cooling device.',
            labelNames: ['index', 'statusName'],
            registers: [this.registry],
        });
        this.coolingDeviceStatusCodeMetric = new client.Gauge({
            name: this.getMetricName('cooling_device_status_code'),
            help: 'This attribute defines the status (code) of the cooling device.',
            labelNames: ['index'],
            registers: [this.registry],
        });
    }
    async update(session) {
        // coolingDeviceTable
        var tableOid = '1.3.6.1.4.1.674.10892.5.4.700.12';
        var columns = [
            2, // coolingDeviceIndex
            5, // coolingDeviceStatus
            6, // coolingDeviceReading
            7, // coolingDeviceType
            8, // coolingDeviceLocationName
            16, // coolingDeviceSubType
            19, // coolingDeviceFQDD
        ];
        var table = await this.snmpTableColumns(session, tableOid, columns);
        for (var key in table) {
            var entry = table[key];

            this.coolingDeviceReadingMetric.labels({
                index: entry[2],
                type: this.convertEnumToText('CoolingDeviceTypeEnum', entry[7], (str) => str.replace('coolingDeviceType', '')),
                subtype: this.convertEnumToText('CoolingDeviceSubTypeEnum', entry[16], (str) => str.replace('coolingDeviceSubType', ''))
            }).set(entry[6]);

            this.coolingDeviceLocationMetric.labels({
                index: entry[2],
                locationName: entry[8]
            }).set(1);

            this.coolingDeviceFqddMetric.labels({
                index: entry[2],
                fqdd: entry[19]
            }).set(1);

            this.setStateSetMetricValues('StatusProbeEnum', (key, value) => {
                this.coolingDeviceStatusMetric.labels({
                    index: entry[2],
                    statusName: value
                }).set(entry[5] == key ? 1 : 0);
            });

            this.coolingDeviceStatusCodeMetric.labels({
                index: entry[2]
            }).set(entry[5]);
        }
    }
}

module.exports = CoolingDeviceMetrics;
