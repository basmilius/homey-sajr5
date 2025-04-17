import { Device } from 'homey';
import { client, type ModbusTCPClient } from 'jsmodbus';
import { Socket } from 'node:net';
import Data from './data';
import mappings from './mappings';
import registers, { type Measurements } from './registers';

const INTERVAL = 10 * 1000;

module.exports = class extends Device {

    async onInit(): Promise<void> {
        this.log('SAJR5 device has been initialized.');
        this.log(`id=${this.getData().id} name=${this.getName()} polling_interval=${INTERVAL}`);

        await this.poll();
    }

    async poll(): Promise<void> {
        const host = this.getSetting('host');
        const port = Number(this.getSetting('port'));

        if (isNaN(port)) {
            return;
        }

        this.log(`polling inverter on ${host}:${port}...`);

        const modbusOptions = {
            host,
            port,
            timeout: 10,
            autoReconnect: false,
            logLabel: 'SAJR5 Inverter',
            logLevel: 'error',
            logEnabled: true,
            noDelay: true
        };

        const socket = new Socket();
        const modbus = new client.TCP(socket, undefined, INTERVAL);

        socket.setKeepAlive(false);
        socket.connect(modbusOptions);

        socket.on('close', async () => await this.onClose());
        socket.on('connect', async () => await this.onConnect(modbus, socket));
        socket.on('error', async (err: Error) => await this.onError(modbus, socket, err));
        socket.on('timeout', async () => await this.onTimeout(modbus, socket));
    }

    async process(measurements: Measurements): Promise<void> {
        console.log('process()', measurements);

        const ctx = {
            maxpeakpower: Number(this.getSetting('maxpeakpower'))
        };

        for (const measurement of measurements) {
            const measurementMappings = mappings.filter(m => m.key === measurement.key);

            for (const mapping of measurementMappings) {
                if (!mapping.check(measurement, ctx)) {
                    continue;
                }

                const value = mapping.map(measurement, ctx, measurements);

                if (value === null || value === undefined) {
                    continue;
                }

                for (const capability of mapping.capabilities) {
                    this.addCapability(capability).catch(this.error);
                    this.setCapabilityValue(capability, value).catch(this.error);
                }
            }
        }

        setTimeout(() => this.poll(), INTERVAL);
    }

    async read(client: ModbusTCPClient): Promise<Measurements> {
        const result = await client.readHoldingRegisters(0x100, 60);
        const response = result.response;
        const body = response.body.valuesAsArray;
        const data = new Data(body);
        const measurements: Measurements = [];

        for (const register of registers) {
            let value: string | number | null;

            switch (register.type) {
                case 'int16':
                    value = data.at(register.id - 0x0100).int16();
                    break;

                case 'uint16':
                    value = data.at(register.id - 0x0100).uint16();
                    break;

                case 'uint32':
                    value = data.at(register.id - 0x0100).uint32();
                    break;
            }

            measurements.push({
                key: register.key,
                value: value,
                scale: register.scale
            });
        }

        return measurements;
    }

    async onClose(): Promise<void> {
        console.log('onClose()', 'Socket closed.');
    }

    async onConnect(client: ModbusTCPClient, socket: Socket): Promise<void> {
        console.log('onConnect()', 'Socket connected.');

        try {
            const measurements = await this.read(client);
            await this.process(measurements);
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error(err);
            }
        }

        client.socket.end();
        socket.end();
    }

    async onError(client: ModbusTCPClient, socket: Socket, err: Error): Promise<void> {
        if (err.message.includes('ECONNREFUSED')) {
            const measurements: Measurements = [];

            for (const register of registers) {
                if (!register.fallback) {
                    continue;
                }

                measurements.push({
                    key: register.key,
                    value: register.fallback(),
                    scale: 0
                });
            }

            return await this.process(measurements);
        }

        console.error('onError()', err.message);
        setTimeout(() => this.poll(), INTERVAL);

        client.socket.end();
        socket.end();
    }

    async onTimeout(client: ModbusTCPClient, socket: Socket): Promise<void> {
        console.warn('onTimeout()', 'Socket timed out.');

        client.socket.end();
        socket.end();
    }

};
