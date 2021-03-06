const snmp = require("net-snmp");

class SnmpMetricsBase {
    constructor(registry) {
        this.registry = registry;
        this.metricsPrefix = process.env.METRICS_PREFIX ?? 'idrac_';

        // Load the iDrac MIB
        var store = snmp.createModuleStore();
        store.loadFromFile('./mibs/iDRAC-SMIv2.mib');
        this.idracMibJsonModule = store.getModule("IDRAC-MIB-SMIv2");
    }

    getMetricName(metricName) {
        return `${this.metricsPrefix}${metricName}`;
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
