import { Device } from 'homey';
import { client, type ModbusTCPClient } from 'jsmodbus';
import { Socket } from 'node:net';
import mappings from './mappings';
import registers, { type Measurement, type Measurements, type Register } from './registers';

const INTERVAL = 5 * 1000;

module.exports = class extends Device {

    timer!: NodeJS.Timeout;

    async onInit(): Promise<void> {
        this.log('SAJR5 device has been initialized.');
        this.log(`id=${this.getData().id} name=${this.getName()} polling_interval=${INTERVAL}`);

        this.timer = setInterval(() => this.poll(), INTERVAL);
        await this.poll();
    }

    async poll(): Promise<void> {
        const host = this.getSetting('host');
        const port = Number(this.getSetting('port'));
        const unitId = Number(this.getSetting('id'));

        if (isNaN(port)) {
            return;
        }

        this.log(`polling inverter on ${host}:${port}...`);

        const modbusOptions = {
            host,
            port,
            unitId,
            timeout: 10,
            autoReconnect: false,
            logLabel: 'SAJR5 Inverter',
            logLevel: 'error',
            logEnabled: true
        };

        const socket = new Socket();
        const modbus = new client.TCP(socket, unitId, 5500);

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
            const mapping = mappings.find(m => m.key === measurement.key);

            if (!mapping || !mapping.check(measurement, ctx)) {
                continue;
            }

            const value = mapping.map(measurement, ctx);

            if (value === null || value === undefined) {
                continue;
            }

            for (const capability of mapping.capabilities) {
                this.addCapability(capability).catch(this.error);
                this.setCapabilityValue(capability, value).catch(this.error);
            }
        }
    }

    async read(client: ModbusTCPClient, {key, id, size, type, label, scale}: Register): Promise<Measurement> {
        const result = await client.readHoldingRegisters(id, size);
        const response = result.response;

        if (type === 'string') return {
            key,
            value: response.body.valuesAsBuffer.toString(),
            scale: 0
        };

        if (type === 'uint16' || type === 'uint32') {
            let value: number | null;

            if (type === 'uint16') {
                value = response.body.valuesAsArray[0];
            } else {
                value = ((response.body.valuesAsArray[0] << 16) | response.body.valuesAsArray[1]);
            }

            if (value === 65535) {
                value = null;
            }

            return {
                key,
                value,
                scale: 0
            };
        }

        throw new Error(`Unknown type ${type}`);
    }

    async onClose(): Promise<void> {
        console.log('onClose()', 'Socket closed.');
    }

    async onConnect(client: ModbusTCPClient, socket: Socket): Promise<void> {
        console.log('onConnect()', 'Socket connected.');

        const measurements: Measurements = [];

        for (const register of registers) {
            try {
                measurements.push(await this.read(client, register));
            } catch (err) {
                if (err instanceof Error) {
                    console.error(err.message);
                } else {
                    console.error(err);
                }
            }
        }

        client.socket.end();
        socket.end();

        await this.process(measurements);
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

        client.socket.end();
        socket.end();
    }

    async onTimeout(client: ModbusTCPClient, socket: Socket): Promise<void> {
        console.warn('onTimeout()', 'Socket timed out.');

        client.socket.end();
        socket.end();
    }

}
