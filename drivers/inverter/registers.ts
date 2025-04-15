const reg = (key: string, id: number, size: number, type: ValueType, label: string, scale: number = 0, fallback: (() => string | number) | null = null): Register => ({
    key,
    id,
    size,
    type,
    label,
    scale,
    fallback
});

export default [
    reg('l1_current', 0x0117, 1, 'uint16', 'L1 Current', -2, () => 0),
    reg('l2_current', 0x011D, 1, 'uint16', 'L2 Current', -2, () => 0),
    reg('l3_current', 0x0123, 1, 'uint16', 'L3 Current', -2, () => 0),
    reg('temperature', 0x0111, 1, 'uint16', 'Temperature', -1),
    // reg('status', 0x0100, 1, 'uint16', 'Status', 0),
    reg('input_power', 0x0113, 1, 'uint16', 'Input Power', 0, () => 0),
    reg('output_power', 0x0113, 1, 'uint16', 'Output Power', 0, () => 0),
    reg('pv1_input_power', 0x0109, 1, 'uint16', 'pv1 Power', 0, () => 0),
    // reg('pv1_voltage', 0x0107, 1, 'uint16', 'pv1 Voltage', -1, () => 0),
    reg('pv2_input_power', 0x010C, 1, 'uint16', 'pv2 Power', 0, () => 0),
    // reg('pv2_voltage', 0x010A, 1, 'uint16', 'pv2 Voltage', -1, () => 0),
    reg('today_energy', 0x012C, 1, 'uint16', 'Today Energy', -2),
    reg('total_energy', 0x0131, 2, 'uint32', 'Total Energy', -2)
] satisfies Registers;

export type Measurement = {
    readonly key: string;
    readonly value: string | number | null;
    readonly scale: number;
}

export type Register = {
    readonly key: string;
    readonly id: number;
    readonly size: number;
    readonly type: ValueType;
    readonly label: string;
    readonly scale: number;
    readonly fallback: (() => string | number) | null;
};

export type Measurements = Measurement[];
export type Registers = Register[];
export type ValueType = 'string' | 'uint16' | 'uint32';
