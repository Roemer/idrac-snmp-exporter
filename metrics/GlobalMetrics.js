const client = require('prom-client');
const snmp = require("net-snmp");
const SnmpMetricsBase = require('./SnmpMetricsBase.js');

class GlobalMetrics extends SnmpMetricsBase {
    constructor(registry) {
        super(registry);

        this.racShortNameMetric = new client.Gauge({
            name: this.getMetricName('rac_short_name'),
            help: 'This attribute defines the short product name of a remote access card.',
            labelNames: ['shortName'],
            registers: [this.registry],
        });
        this.racFirmwareVersionMetric = new client.Gauge({
            name: this.getMetricName('rac_firmware_version'),
            help: 'This attribute defines the firmware version of a remote access card.',
            labelNames: ['firmwareVersion'],
            registers: [this.registry],
        });
        this.systemServiceTagMetric = new client.Gauge({
            name: this.getMetricName('system_service_tag'),
            help: 'This attribute defines the service tag of the system.',
            labelNames: ['serviceTag'],
            registers: [this.registry],
        });
        this.systemModelNameMetric = new client.Gauge({
            name: this.getMetricName('system_model_name'),
            help: 'This attribute defines the model name of the system.',
            labelNames: ['modelName'],
            registers: [this.registry],
        });
        this.globalSystemStatusMetric = new client.Gauge({
            name: this.getMetricName('global_system_status'),
            help: `This attribute defines the overall rollup status of all
components in the system being monitored by the remote access card`,
            labelNames: ['statusName'],
            registers: [this.registry],
        });
        this.globalSystemStatusCodeMetric = new client.Gauge({
            name: this.getMetricName('global_system_status_code'),
            help: `This attribute defines the overall rollup status (code) of all
components in the system being monitored by the remote access card`,
            labelNames: [],
            registers: [this.registry],
        });
        this.globalStorageStatusMetric = new client.Gauge({
            name: this.getMetricName('global_storage_status'),
            help: `This attribute defines the overall storage status being
monitored by the remote access card.`,
            labelNames: ['statusName'],
            registers: [this.registry],
        });
        this.globalStorageStatusCodeMetric = new client.Gauge({
            name: this.getMetricName('global_storage_status_code'),
            help: `This attribute defines the overall storage status (code) being
monitored by the remote access card.`,
            labelNames: [],
            registers: [this.registry],
        });
        this.systemPowerStateMetric = new client.Gauge({
            name: this.getMetricName('system_power_state'),
            help: `This attribute defines the power state of the system.`,
            labelNames: ['stateName'],
            registers: [this.registry],
        });
        this.systemPowerStateCodeMetric = new client.Gauge({
            name: this.getMetricName('system_power_state_code'),
            help: `This attribute defines the power state (code) of the system.`,
            labelNames: [],
            registers: [this.registry],
        });
        this.systemPowerUpTimeMetric = new client.Gauge({
            name: this.getMetricName('system_power_up_time'),
            help: `This attribute defines the power-up time of the system in seconds.`,
            labelNames: [],
            registers: [this.registry],
        });
    }
    async update(session) {
        var oids = {
            // racShortName
            '1.3.6.1.4.1.674.10892.5.1.1.2.0': (snmpValue) => {
                this.racShortNameMetric.labels({ shortName: snmpValue }).set(1);
            },
            // racFirmwareVersion
            '1.3.6.1.4.1.674.10892.5.1.1.8.0': (snmpValue) => {
                this.racFirmwareVersionMetric.labels({ firmwareVersion: snmpValue }).set(1);
            },
            // systemServiceTag
            '1.3.6.1.4.1.674.10892.5.1.3.2.0': (snmpValue) => {
                this.systemServiceTagMetric.labels({ serviceTag: snmpValue }).set(1);
            },
            // systemModelName
            '1.3.6.1.4.1.674.10892.5.1.3.12.0': (snmpValue) => {
                this.systemModelNameMetric.labels({ modelName: snmpValue }).set(1);
            },
            // globalSystemStatus
            '1.3.6.1.4.1.674.10892.5.2.1.0': (snmpValue) => {
                this.setStateSetMetricValues('ObjectStatusEnum', (key, value) => {
                    this.globalSystemStatusMetric.labels({ statusName: value }).set(snmpValue == key ? 1 : 0);
                });
                this.globalSystemStatusCodeMetric.set(snmpValue);
            },
            // globalStorageStatus
            '1.3.6.1.4.1.674.10892.5.2.3.0': (snmpValue) => {
                this.setStateSetMetricValues('ObjectStatusEnum', (key, value) => {
                    this.globalStorageStatusMetric.labels({ statusName: value }).set(snmpValue == key ? 1 : 0);
                });
                this.globalStorageStatusCodeMetric.set(snmpValue);
            },
            // systemPowerState
            '1.3.6.1.4.1.674.10892.5.2.4.0': (snmpValue) => {
                this.setStateSetMetricValues('PowerStateStatusEnum', (key, value) => {
                    this.systemPowerStateMetric.labels({ stateName: value }).set(snmpValue == key ? 1 : 0);
                });
                this.systemPowerStateCodeMetric.set(snmpValue);
            },
            // systemPowerUpTime            
            '1.3.6.1.4.1.674.10892.5.2.5.0': (snmpValue) => {
                this.systemPowerUpTimeMetric.set(snmpValue);
            }
        };

        var varbinds = await this.snmpGet(session, Object.keys(oids));
        for (var i = 0; i < varbinds.length; i++) {
            if (snmp.isVarbindError(varbinds[i])) {
                console.error(snmp.varbindError(varbinds[i]));
            } else {
                if (oids[varbinds[i].oid]) {
                    oids[varbinds[i].oid](varbinds[i].value);
                }
            }
        }
    }
}

module.exports = GlobalMetrics;
