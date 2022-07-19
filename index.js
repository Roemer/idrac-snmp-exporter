'use strict';

const express = require('express');
const client = require('prom-client');
const snmp = require("net-snmp");

const AmperageProbeMetrics = require('./metrics/AmperageProbeMetrics.js');
const CoolingDeviceMetrics = require('./metrics/CoolingDeviceMetrics.js');
const GlobalMetrics = require('./metrics/GlobalMetrics.js');
const ChassisInformationMetrics = require('./metrics/ChassisInformationMetrics.js');
const MemoryDeviceMetrics = require('./metrics/MemoryDeviceMetrics.js');

// Create the express server
const app = express();

// Create a Registry to register the metrics
const registry = new client.Registry();

// Create the metrics
const metrics = [
    new AmperageProbeMetrics(registry),
    new CoolingDeviceMetrics(registry),
    new GlobalMetrics(registry),
    new ChassisInformationMetrics(registry),
    new MemoryDeviceMetrics(registry),
];

// Configure express
app.get('/metrics', async (req, res) => {
    var target = req.query.target;
    if (!target) {
        return res.status(500).send({
            message: 'No target parameter!'
         });
    }
    var community = req.query.community ?? 'public';
    await updateMetrics(target, community);
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
});

// Start express
const port = 8080;
app.listen(port, () => console.log(`Server is running on http://localhost:${port}, metrics are exposed on http://localhost:${port}/metrics`));

async function updateMetrics(target, community) {
    registry.resetMetrics();
    var session = snmp.createSession(target, community);
    for (var metric of metrics) {
        await metric.update(session);
    }
    session.close();
}
