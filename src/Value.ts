import { ITextRenderer, IValue, VAR_NOW, VAR_RANDOM, VAR_UUID } from "./core";

export class NumberValue implements IValue {
    constructor(public value: number) { }

    // setValue(value: number) { this.value = value; }

    next(step: number) {
        return new NumberValue(this.value + step);
    }

    format(renderer: ITextRenderer) {
        return renderer.formatNumber(this.value);
    }
}

export class DateValue implements IValue {
    constructor(public value: Date) { }

    /**
     * Seconds to add
     * @param step
     * @returns 
     */
    next(step: number) {
        const newTime = this.value.getTime() + step * 1000;
        return new DateValue(new Date(newTime));
    }

    format(renderer: ITextRenderer) {
        return renderer.formatDate(this.value);
    }
}

export class RandomValue implements IValue {
    value: number;

    constructor(public min: number, public max: number) {
        this.value = this.getRandom();
    }

    getRandom() {
        return this.min + (this.max - this.min) * Math.random();
    }

    next(step: number) {
        return new RandomValue(this.min, this.max);
    }

    format(renderer: ITextRenderer) {
        return renderer.formatNumber(this.value);
    }
}

export type UUIDOptions = { withBrackets: boolean, upperCase: boolean }
export class UUIDValue implements IValue {
    value: string;

    constructor(public opts: UUIDOptions) {
        this.value = crypto.randomUUID();
        if (this.opts.upperCase) {
            this.value = this.value.toUpperCase();
        }
        if (this.opts.withBrackets) {
            this.value = `{${this.value}}`;
        }
    }

    next(step: number) {
        return new UUIDValue(this.opts);
    }

    format(renderer: ITextRenderer) {
        return this.value;
    }
}

export function isNow(value: any) {
    return VAR_NOW.includes(value);
}

export function isRandom(value: any) {
    return VAR_RANDOM.includes(value);
}

export function isUUID(value: any) {
    return VAR_UUID.includes(value);
}
