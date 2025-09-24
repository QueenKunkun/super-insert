import { Plugin } from "../rose-formatter";
import { ISequnce, ITextRenderer } from "./core";

export class SequenceRenderer implements ITextRenderer {
    constructor(private seq: ISequnce) { }

    setPlugin(plugin?: Plugin): void {
    }

    formatNumber(n: number): string {
        return this.seq.getItem(n);
    }

    formatDate(n: Date): string {
        return `${n}`;
    }
}

export class OriginalTextRenderer implements ITextRenderer {

    setPlugin(plugin?: Plugin): void {
    }

    formatNumber(n: number): string {
        return `${n}`;
    }

    formatDate(n: Date): string {
        return `${n}`;
    }
}

