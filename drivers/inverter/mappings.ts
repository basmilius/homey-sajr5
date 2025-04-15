import { Measurement } from './registers';

export type Mapping = {
    readonly key: string;
    readonly capabilities: string[];

    check(data: Measurement, ctx: Record<string, any>): boolean;
    map(data: Measurement, ctx: Record<string, any>): string | number | null;
};

export type Mappings = Mapping[];

export default [
    {
        key: 'output_power',
        capabilities: ['measure_power'],
        check: (data, ctx) => {
            if (data.value === null || typeof data.value !== 'number') return false;
            const value = data.value * 10 ** Number(data.scale ?? 0);
            return !ctx || ctx.maxpeakpower <= 0 || value <= ctx.maxpeakpower;
        },
        map: (data, ctx) => {
            const power = Number(data.value) * 10 ** Number(data.scale ?? 0);
            return ctx && ctx.maxpeakpower > 0 && power > ctx.maxpeakpower ? null : Math.round(power);
        }
    },
    {
        key: 'input_power',
        capabilities: ['measure_power.input'],
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
        key: 'pv1_input_power',
        capabilities: ['measure_power.pv1input'],
        check: data => data.value !== null && typeof data.value === 'number',
        map: data => Number(data.value) * 10 ** Number(data.scale ?? 0)
    },
    {
        key: 'pv2_input_power',
        capabilities: ['measure_power.pv2input'],
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
] satisfies Mappings;
