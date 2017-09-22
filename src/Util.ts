import * as crypto from "crypto";

export const randomInt = (min: number, max: number): number => {
    const range = max - min;

    const bitLength = Math.ceil(Math.log2(range));
    if (bitLength > 31) {
        throw new Error("Cannot randomly generate numbers using more than 31 bits.");
    }
    const byteLength = Math.ceil(bitLength / 8);
    const mask = Math.pow(2, bitLength) - 1;

    const byteArray = crypto.randomBytes(byteLength);

    const sum = byteArray.reduce((sum, value, index) => {
        return sum + (value * Math.pow(256, index));
    }, 0);

    const masked = sum & mask;
    if (masked >= range) {
        return randomInt(min, max);
    }

    return min + masked;
}

export const random = (): number => {
    const precision = 0x7FFFFFFF;
    return randomInt(0, precision) / precision;
}
