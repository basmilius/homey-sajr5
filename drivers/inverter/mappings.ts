import type { Measurement, Measurements, RegisterKey } from './registers';

export type Mapping = {
    readonly key: RegisterKey;
    readonly capabilities: string[];

    check(data: Measurement, ctx: Record<string, any>): boolean;
    map(data: Measurement, ctx: Record<string, any>, measurements: Measurements): string | number | null;
};

export type Mappings = Mapping[];

const mappings: Mappings = [
    {
        key: 'power',
        capabilities: ['measure_power'],
        check: (data, ctx) => {
            if (data.value === null || typeof data.value !== 'number') return false;
            const value = data.value * 10 ** Number(data.scale ?? 0);
            return !ctx || ctx.maxpeakpower <= 0 || value <= ctx.maxpeakpower;
        },
        map: (data, ctx, measurements) => {
            let power = Number(data.value) * 10 ** Number(data.scale ?? 0);
            const powerFactorMeasurement = measurements.find(m => m.key === 'power_factor');
            const powerFactorMapping = mappings.find(m => m.key === 'power_factor');

            if (powerFactorMeasurement && powerFactorMapping) {
                const powerFactor = powerFactorMapping.map(powerFactorMeasurement, ctx, measurements);

                if (powerFactor !== null && typeof powerFactor === 'number') {
                    power = power * powerFactor;
                }
            }

            return ctx && ctx.maxpeakpower > 0 && power > ctx.maxpeakpower ? null : Math.round(power);
        }
    },
    {
        key: 'power',
        capabilities: ['measure_power.input'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'power_factor',
        capabilities: [],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'l1_current',
        capabilities: ['measure_current.phase1'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'l2_current',
        capabilities: ['measure_current.phase2'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'l3_current',
        capabilities: ['measure_current.phase3'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'pv1_power',
        capabilities: ['measure_power.pv1input'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'pv2_power',
        capabilities: ['measure_power.pv2input'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'pv3_power',
        capabilities: ['measure_power.pv3input'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'temperature',
        capabilities: ['measure_temperature.invertor'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'today_energy',
        capabilities: ['meter_power.daily'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'total_energy',
        capabilities: ['meter_power'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    }
];

export default mappings;
