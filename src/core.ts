export const VAR_NOW = ['today', 'now'] as const;
export const VAR_RANDOM = ['random', 'rand'] as const;

export type Start = typeof VAR_RANDOM[number] | typeof VAR_NOW | number | Date;

export interface ITextRenderer {
    formatNumber(n: number): string;
    formatDate(n: Date): string;
}

export interface ISequnce {
    contains(txt: string): boolean;
    findIndex(txt: string): number;
    toString(): string;
    getItem(index: number): string;
    getSequence(): string[];
}

export interface IInsertSettngs {
    defaultFormat?: string; // always the last one in user's input
    start?: Start;
    step?: number;
    extra?: number;
    builtInSequence?: ISequnce,
}

export interface IValue {
    next(step: number): IValue;
    format(renderer: ITextRenderer): string;
}

export type IStep = number;

export interface SequenceSetting {
    value: IValue,
    step: IStep, // seconds for Date
    formatter: ITextRenderer,
}


const ANY_NUMBER_REGEX = /^NaN|-?((\d*\.\d+|\d+)([Ee][+-]?\d+)?|Infinity)$/;
const NUMBER_REGEX = /^-?(\d*\.\d+|\d+)([Ee][+-]?\d+)?$/;

export function isNumber(x: string | undefined): x is string {
    if (typeof x !== 'undefined') { return NUMBER_REGEX.test(x); }
    return false;
}

export function parseNumber(x: string | undefined) {
    if (isNumber(x)) {
        try {
            if (x.includes(".")) {
                return parseFloat(x);
            }

            return parseInt(x);
        } catch (error) {
        }
    }
}
