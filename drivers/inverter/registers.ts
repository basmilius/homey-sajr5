const reg = (key: RegisterKey, id: number, type: ValueType, label: string, scale: number = 0, fallback: (() => string | number) | null = null): Register => ({
    key,
    id,
    type,
    label,
    scale,
    fallback
});

export default [
    reg('pv1_voltage', 0x0107, 'uint16', 'PV1 Voltage', -1, () => 0),
    reg('pv1_current', 0x0108, 'uint16', 'PV1 Current', -2, () => 0),
    reg('pv1_power', 0x0109, 'uint16', 'PV1 Power', 0, () => 0),

    reg('pv2_voltage', 0x010A, 'uint16', 'PV2 Voltage', -1, () => 0),
    reg('pv2_current', 0x010B, 'uint16', 'PV2 Current', -2, () => 0),
    reg('pv2_power', 0x010C, 'uint16', 'PV2 Power', 0, () => 0),

    reg('pv3_voltage', 0x010D, 'uint16', 'PV3 Voltage', -1, () => 0),
    reg('pv3_current', 0x010E, 'uint16', 'PV3 Current', -2, () => 0),
    reg('pv3_power', 0x010F, 'uint16', 'PV3 Power', 0, () => 0),

    reg('busvolt', 0x0110, 'uint16', 'Bus Voltage', -1, () => 0),
    reg('temperature', 0x0111, 'int16', 'Temperature', -1, () => 0),
    reg('gfci', 0x0112, 'int16', 'GFCI', -1, () => 0),
    reg('power', 0x0113, 'uint16', 'Power', 0, () => 0),
    reg('qpower', 0x0114, 'int16', 'QPower', 0, () => 0),
    reg('power_factor', 0x0115, 'int16', 'Power Factor', -3, () => 0),

    reg('l1_voltage', 0x0116, 'uint16', 'L1 Voltage', -1, () => 0),
    reg('l1_current', 0x0117, 'uint16', 'L1 Current', -2, () => 0),
    reg('l1_frequency', 0x0118, 'uint16', 'L1 Frequency', -2, () => 0),
    reg('l1_direct_current_component', 0x0119, 'int16', 'L1 Direct Current Component', 0, () => 0),
    reg('l1_power', 0x011A, 'uint16', 'L1 Power', 0, () => 0),
    reg('l1_power_factor', 0x011B, 'int16', 'L1 Power Factor', -3, () => 0),

    reg('l2_voltage', 0x011C, 'uint16', 'L2 Voltage', -1, () => 0),
    reg('l2_current', 0x011D, 'uint16', 'L2 Current', -2, () => 0),
    reg('l2_frequency', 0x011E, 'uint16', 'L2 Frequency', -2, () => 0),
    reg('l2_direct_current_component', 0x011F, 'int16', 'L2 Direct Current Component', 0, () => 0),
    reg('l2_power', 0x0120, 'uint16', 'L2 Power', 0, () => 0),
    reg('l2_power_factor', 0x0121, 'int16', 'L2 Power Factor', -3, () => 0),

    reg('l3_voltage', 0x0122, 'uint16', 'L3 Voltage', -1, () => 0),
    reg('l3_current', 0x0123, 'uint16', 'L3 Current', -2, () => 0),
    reg('l3_frequency', 0x0124, 'uint16', 'L3 Frequency', -2, () => 0),
    reg('l3_direct_current_component', 0x0125, 'int16', 'L3 Direct Current Component', 0, () => 0),
    reg('l3_power', 0x0126, 'uint16', 'L3 Power', 0, () => 0),
    reg('l3_power_factor', 0x0127, 'int16', 'L3 Power Factor', -3, () => 0),

    reg('iso1', 0x0128, 'uint16', 'ISO1', 0, () => 0),
    reg('iso2', 0x0129, 'uint16', 'ISO2', 0, () => 0),
    reg('iso3', 0x012A, 'uint16', 'ISO3', 0, () => 0),
    reg('iso4', 0x012B, 'uint16', 'ISO4', 0, () => 0),

    reg('today_energy', 0x012C, 'uint16', 'Today Energy', -2, () => 0),
    reg('month_energy', 0x012D, 'uint32', 'Month Energy', -2, () => 0),
    reg('year_energy', 0x012F, 'uint32', 'Year Energy', -2, () => 0),
    reg('total_energy', 0x0131, 'uint32', 'Total Energy', -2, () => 0),
    reg('today_hour', 0x0133, 'uint16', 'Today Hour', -1, () => 0),
    reg('total_hour', 0x0134, 'uint32', 'Total Hour', -1, () => 0)
] satisfies Registers;

export type Measurement = {
    readonly key: RegisterKey;
    readonly value: string | number | null;
    readonly scale: number;
}

export type Register = {
    readonly key: RegisterKey;
    readonly id: number;
    readonly type: ValueType;
    readonly label: string;
    readonly scale: number;
    readonly fallback: (() => string | number) | null;
};

export type RegisterKey =
    | 'pv1_voltage'
    | 'pv1_current'
    | 'pv1_power'
    | 'pv2_voltage'
    | 'pv2_current'
    | 'pv2_power'
    | 'pv3_voltage'
    | 'pv3_current'
    | 'pv3_power'
    | 'busvolt'
    | 'temperature'
    | 'gfci'
    | 'power'
    | 'qpower'
    | 'power_factor'
    | 'l1_voltage'
    | 'l1_current'
    | 'l1_frequency'
    | 'l1_direct_current_component'
    | 'l1_power'
    | 'l1_power_factor'
    | 'l2_voltage'
    | 'l2_current'
    | 'l2_frequency'
    | 'l2_direct_current_component'
    | 'l2_power'
    | 'l2_power_factor'
    | 'l3_voltage'
    | 'l3_current'
    | 'l3_frequency'
    | 'l3_direct_current_component'
    | 'l3_power'
    | 'l3_power_factor'
    | 'iso1'
    | 'iso2'
    | 'iso3'
    | 'iso4'
    | 'today_energy'
    | 'month_energy'
    | 'year_energy'
    | 'total_energy'
    | 'today_hour'
    | 'total_hour';

export type Measurements = Measurement[];
export type Registers = Register[];
export type ValueType =
    | 'int16'
    | 'uint16'
    | 'uint32';
