import { ISequnce } from "./core";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const CN_GAN = "甲乙丙丁戊己庚辛壬癸";
const CN_ZHI = "子丑寅卯辰巳午未申酉戌亥";
const CN_COLOR = "红橙黄绿蓝靛紫";
const CN_BIOCLASSES = "域界门纲目科属种";
const MUSIC_SYMBOLS = "Do,Re,Mi,Fa,Sol,La,Si".split(',');
const CN_JIA_ZI = Array.from(calc60JiaZi());
const CONSTELLATION = "Aries,Taurus,Gemini,Cancer,Leo,Virgo,Libra,Scorpio,Sagittarius,Capricorn,Aquarius,Pisces".split(',');
const CN_CONSTELLATION = "白羊、金牛、双子、巨蟹、狮子、处女、天秤、天蝎、射手、摩羯、水瓶、双鱼".split('、');
const SOLAR_TERM = "立春、雨水、惊蛰、春分、清明、谷雨、立夏、小满、芒种、夏至、小暑、大暑、立秋、处暑、白露、秋分、寒露、霜降、立冬、小雪、大雪、冬至、小寒、大寒".split('、');

const CaseInsensitiveSequences = [
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    MUSIC_SYMBOLS,
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",],
    CONSTELLATION,
];

const CaseSensitiveSequences = [
    ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    ['日', '一', '二', '三', '四', '五', '六'],
    ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
    ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '亿'],
    ['零', '壹', '貳', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'],
    ['零', '壹', '貳', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '佰', '仟', '萬', '億'],
    CN_CONSTELLATION,
    SOLAR_TERM,
    CN_JIA_ZI,
    CN_GAN.split(""),
    CN_ZHI.split(""),
    CN_BIOCLASSES.split(""),
    CN_COLOR.split(""),
    ALPHABET.split(""),
    ALPHABET.toUpperCase().split(""),
];

export function normalizeIndex(len: number, index: number): number {
    if (len < 0) { throw Error(`'len' could not be less than 0`); }

    if (index < 0) {
        let ii = index % len;
        return len + ii;
    }
    if (index >= len) {
        let ii = index % len;
        return ii;
    }

    return index;
}

function* calc60JiaZi() {
    const ganLen = CN_GAN.length;
    const zhiLen = CN_ZHI.length;
    for (let index = 0; index < 60; index++) {
        const g = CN_GAN[normalizeIndex(ganLen, index)];
        const z = CN_ZHI[normalizeIndex(zhiLen, index)];
        yield `${g}${z}`;
    }
}

class TextSequnce implements ISequnce {
    constructor(public value: string[]) { }

    getSequence(): string[] {
        return this.value;
    }
    contains(txt: string) {
        return this.value.includes(txt);
    }

    findIndex(txt: string) {
        return this.value.findIndex(x => x === txt);
    }

    toString() {
        return this.value.toString();
    }

    getItem(index: number): string {
        const idx = normalizeIndex(this.value.length, index);
        return this.value[idx];
    }
}

class CaseInsensitiveTextSequence extends TextSequnce {
    constructor(value: string[]) { super(value); }

    override contains(txt: string) {
        return this.value.some(x => x.toLocaleLowerCase() === txt.toLocaleLowerCase());
    }

    override findIndex(txt: string) {
        return this.value.findIndex(x => x.toLocaleLowerCase() === txt.toLocaleLowerCase());
    }
}

export const BuiltInSequences: ISequnce[] = CaseInsensitiveSequences.map(
    x => new CaseInsensitiveTextSequence(x))
    .concat(CaseSensitiveSequences.map(x => new TextSequnce(x)));


export function registerSequences(sequence: string[], caseSensitive: boolean) {
    const seq = caseSensitive ? new TextSequnce(sequence) : new CaseInsensitiveTextSequence(sequence);
    BuiltInSequences.push(seq);
}

export function searchInBuiltInSequences(txt: string) {
    return BuiltInSequences.filter(seq => seq.contains(txt));
}
