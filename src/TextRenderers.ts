import { ISequnce, ITextRenderer } from "./core";

export class SequenceRenderer implements ITextRenderer {
    constructor(private seq: ISequnce) { }

    formatNumber(n: number): string {
        return this.seq.getItem(n);
    }

    formatDate(n: Date): string {
        return `${n}`;
    }
}

export class OriginalTextRenderer implements ITextRenderer {
    formatNumber(n: number): string {
        return `${n}`;
    }

    formatDate(n: Date): string {
        return `${n}`;
    }
}

