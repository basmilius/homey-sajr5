export default class Data {
    readonly #data: Uint16Array | number[];
    #position: number = 0;

    constructor(data: Uint16Array | number[]) {
        this.#data = data;
    }

    at(position: number): Data {
        this.#position = position;

        return this;
    }

    int16(): number | null {
        const value = this.#data[this.#position];
        this.#position += 1;

        if (value >= 0x8000) {
            return value - 0x10000;
        }

        return value;
    }

    skip(amount: number): Data {
        this.#position += amount;

        return this;
    }

    uint16(): number | null {
        const value = this.#data[this.#position];
        this.#position += 1;

        if (value === 65535) {
            return null;
        }

        return value;
    }

    uint32(): number | null {
        const value = (this.#data[this.#position] << 16) | this.#data[this.#position + 1];
        this.#position += 2;

        if (value === 65535) {
            return null;
        }

        return value;
    }
}
