import { Device } from 'homey';
import { client, type ModbusTCPClient } from 'jsmodbus';
import { Socket } from 'node:net';
import Data from './data';
import mappings from './mappings';
import registers, { type Measurements } from './registers';

const PROBABLY_OFFLINE = ['ECONNREFUSED', 'EHOSTUNREACH'] as const;

module.exports = class extends Device {

    #interval: number = 10 * 1000;
    #timeout: number = 0;

    async onInit(): Promise<void> {
        await this.updateInterval();
        await this.poll();

        this.log('SAJR5 device has been initialized.');
    }

    async disconnect(client: ModbusTCPClient, socket: Socket): Promise<void> {
        try {
            if (client.socket && !client.socket.destroyed) {
                client.socket.end();
            }

            if (socket && !socket.destroyed) {
                socket.end();
            }
        } catch (err) {
            console.error(err);
        }
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
            timeout: 15,
            autoReconnect: false,
            logLabel: 'SAJR5 Inverter',
            logLevel: 'error',
            logEnabled: true,
            noDelay: true
        };

        const socket = new Socket();
        const modbus = new client.TCP(socket, undefined, this.#interval);

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

    async schedule(): Promise<void> {
        this.#timeout && clearTimeout(this.#timeout);
        this.#timeout = setTimeout(() => this.poll(), this.#interval) as unknown as number;
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

        await this.disconnect(client, socket);
        await this.schedule();
    }

    async onError(client: ModbusTCPClient, socket: Socket, err: Error): Promise<void> {
        await this.disconnect(client, socket);

        if (PROBABLY_OFFLINE.some(code => err.message.includes(code))) {
            return await this.onProbablyOffline();
        }

        console.error('onError()', err.message);
        await this.schedule();
    }

    async onProbablyOffline(): Promise<void> {
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

        await this.process(measurements);
        await this.schedule();
    }

    async onTimeout(client: ModbusTCPClient, socket: Socket): Promise<void> {
        console.warn('onTimeout()', 'Socket timed out.');

        await this.disconnect(client, socket);
    }

    async onSettings(): Promise<void> {
        await this.updateInterval();
        await this.schedule();
    }

    async updateInterval(): Promise<void> {
        setTimeout(() => {
            this.#interval = (this.getSetting('polling_interval') ?? 10000) as number;
            this.log(`id=${this.getData().id} name=${this.getName()} polling_interval=${this.#interval}`);
        }, 100);
    }

};
