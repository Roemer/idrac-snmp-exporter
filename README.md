# idrac-snmp-exporter
## Introduction
This project aims to generate a yaml file which allows exporting SNMP metrics from Dell iDRAC systems with the [snmp_exporter](https://github.com/prometheus/snmp_exporter).

## Usage
Download the snmp.yml and either add the content of it to your existing one or replace it completely and you should be able to use `module=dell_idrac` for the snmp_exporter.

## Development
The `snmp.yml` is automatically generated with the [generator](https://github.com/prometheus/snmp_exporter/tree/main/generator) with a GitHub Actions pipeline.
To improve how it is generated, just modify the `generator.yml` file.

To locally run the generator in a Docker container, you can use the following commands:
```bash
# Run the container
docker run -it --rm --entrypoint=/bin/bash prom/snmp-generator:v0.20.0
# Inside the container
curl --silent --output /dell-mib.zip https://downloads.dell.com/FOLDER05075499M/1/Dell-OM-MIBS-910_A00.zip?uid=d6ce9226-aad9-4081-7338-a26446a6e850&fn=Dell-OM-MIBS-910_A00.zip
unzip -q /dell-mib.zip -d /dell-mib
mkdir -p ./mibs
cp /dell-mib/support/station/mibs/iDRAC-SMIv2.mib ./mibs/iDRAC-SMIv2.mib
curl --silent --output ./mibs/SNMPv2-SMI.mib https://www.circitor.fr/Mibs/Mib/S/SNMPv2-SMI.mib
curl --silent --output ./mibs/SNMPv2-TC.mib https://www.circitor.fr/Mibs/Mib/S/SNMPv2-TC.mib
apt update
apt install nano
# Edit the file here as you want
nano generator.yml
/go/bin/generator generate
# Inspect the generated file
cat snmp.yml
```
