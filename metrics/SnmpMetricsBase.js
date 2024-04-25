const client = require('prom-client');
const snmp = require('net-snmp');

class SnmpMetricsBase {
    constructor(registry) {
        this.registry = registry;
        
        this.metricsPrefix = process.env.METRICS_PREFIX ?? 'idrac_';
        this.includeChassisIndex = true;
        this.statusAsEnum = true;
        this.statusAsNumber = true;

        // Load the iDrac MIB
        var store = snmp.createModuleStore();
        store.loadFromFile('./mibs/iDRAC-SMIv2.mib');
        this.idracMibJsonModule = store.getModule("IDRAC-MIB-SMIv2");
    }
    
    /**
     * Creates a new gauge metric.
     * @param {Object} createSettings - The settings object.
     * @param {string} createSettings.name - The name of the metric.
     * @param {string[]} createSettings.labelNames - The list of labels to add.
     * @param {boolean} createSettings.withIndex - Adds index labels if set to true.
     * @param {string} createSettings.help - The help text to show.
     */
    createGauge({name = '', labelNames = [], withIndex = false, help = ''} = {}) {
        return new client.Gauge({
            name: this.getMetricName(name),
            help: help,
            labelNames: this.createLabels(withIndex, labelNames),
            registers: [this.registry],
        });
    }
    
    setGaugeWithIndex(metric, value, labels = {}) {
        metric.labels(labels).set(value);
    }
    
    setGaugeWithIndex(metric, value, chassisIndex, index, labels = {}) {
        metric.labels(
            this.getLabelsWithIndex(chassisIndex, index, labels)
        ).set(value);
    }

    /**
     * Builds the metric name with the prefix appended.
     * @param {string} metricName - The name of the metric.
     */
    getMetricName(metricName) {
        return `${this.metricsPrefix}${metricName}`;
    }
    
    /**
     * Builds a list of labels with additional index labels if wanted.
     * @param {boolean} withIndex - Adds index labels if set to true.
     * @param {string[]} customLabels - The list of labels to add.
     */
    createLabels(withIndex, ...customLabels) {
        var retArray = [];
        if (withIndex) {
            if (this.includeChassisIndex) {
                retArray.push('chassisIndex');
            }
            retArray.push('index');
        }
        return retArray.concat(customLabels).flat();
    }
    
    /**
     * Fills in the labels with the given values.
     * @param {number} chassisIndex - The chassis index value.
     * @param {number} index - The index value.
     * @param {Object} labels - Additional hash of values in the form of key:value.
     */
    getLabelsWithIndex(chassisIndex, index, labels) {
        var retObject = {};
        if (this.includeChassisIndex) {
            retObject.chassisIndex = chassisIndex;
        }
        retObject.index = index;
        return {...retObject, ...labels};
    }
    
    addToArray(array, value, condition) {
        if (condition) {
            array.push(value);
        }
        return array;
    }

    convertEnumToText(enumName, enumValue, postProcess) {
        var values = this.getEnumValues(enumName, postProcess);
        var value = values[enumValue];
        return value;
    }

    getEnumValues(enumName, postProcess) {
        var values = this.idracMibJsonModule[enumName].SYNTAX.INTEGER;
        Object.keys(values).forEach(function (key) {
            var value = values[key];
            values[key] = postProcess ? postProcess(value) : value;
        });
        return values;
    }

    setStateSetMetricValues(enumName, metricSetMethod) {
        var values = this.getEnumValues(enumName);
        for (const key in values) {
            metricSetMethod(key, values[key]);
        }
    }

    snmpGet(session, oids) {
        return new Promise(function (resolve, reject) {
            session.get(oids, function (error, varbinds) {
                if (error) {
                    reject(error.toString());
                } else {
                    resolve(varbinds);
                }
            });
        });
    }

    snmpTable(session, oid) {
        return new Promise(function (resolve, reject) {
            session.table(oid, function (error, table) {
                if (error) {
                    reject(error.toString());
                } else {
                    resolve(table);
                }
            });
        });
    }

    snmpTableColumns(session, oid, columns) {
        return new Promise(function (resolve, reject) {
            session.tableColumns(oid, columns, function (error, table) {
                if (error) {
                    reject(error.toString());
                } else {
                    resolve(table);
                }
            });
        });
    }

    snmpSubtree(session, oid) {
        return new Promise(function (resolve, reject) {
            var retValues = [];
            session.subtree(oid, function (varbinds) {
                for (const element of varbinds) {
                    if (snmp.isVarbindError(element))
                        console.error(snmp.varbindError(element));
                    else {
                        console.log(element.oid + " = " + element.value);
                        retValues += element;
                    }
                }
            }, function (error) {
                if (error) {
                    reject(error.toString());
                } else {
                    resolve(retValues);
                }
            });
        });
    }

    snmpWalk(session, oid) {
        return new Promise(function (resolve, reject) {
            var retValues = [];
            session.walk(oid, function (varbinds) {
                for (const element of varbinds) {
                    if (snmp.isVarbindError(element))
                        console.error(snmp.varbindError(element));
                    else {
                        console.log(element.oid + " = " + element.value);
                        retValues += element;
                    }
                }
            }, function (error) {
                if (error) {
                    reject(error.toString());
                } else {
                    resolve(retValues);
                }
            });
        });
    }
}

module.exports = SnmpMetricsBase
