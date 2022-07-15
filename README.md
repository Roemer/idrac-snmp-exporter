# idrac-snmp-exporter
## Introduction
This project aims to generate a yaml file which allows exporting SNMP metrics from Dell iDRAC systems with the [snmp_exporter](https://github.com/prometheus/snmp_exporter).

## Usage
Download the snmp.yml and either add the content of it to your existing one or replace it completely and you should be able to use `module=dell_idrac` for the snmp_exporter.

## Development
The `snmp.yml` is automatically generated with the [generator](https://github.com/prometheus/snmp_exporter/tree/main/generator) with a GitHub Actions pipeline.
To improve how it is generated, just modify the `generator.yml` file.
