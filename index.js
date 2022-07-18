'use strict';

const express = require('express');
const client = require('prom-client');
const snmp = require("net-snmp");

const AmperageProbeMetrics = require('./metrics/AmperageProbeMetrics.js');

// Create the express server
const app = express();

// Create a Registry to register the metrics
const registry = new client.Registry();

// Create the metrics
const metrics = [
	new AmperageProbeMetrics(registry),
];

// Configure express
app.get('/metrics', async (req, res) => {
    await updateMetrics();
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
});

// Start express
const port = 8085;
app.listen(port, () => console.log(`Server is running on http://localhost:${port}, metrics are exposed on http://localhost:${port}/metrics`));

async function updateMetrics() {
    registry.resetMetrics();
    var session = snmp.createSession("192.168.44.68", "public");
	for (var metric of metrics) {
		await metric.update(session);
	}
    session.close();
}