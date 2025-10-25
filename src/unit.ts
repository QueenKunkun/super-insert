

const REGEX_FACTORS = [
    { regex: /(\d+)\s*d/, factor: 86400 },
    { regex: /(\d+)\s*h/, factor: 3600 },
    { regex: /(\d+)\s*m/, factor: 60 },
    { regex: /(\d+)\s*s/, factor: 1 },
    { regex: /^\s*(\d+)\s*$/, factor: 1 },
];

export function getSeconds(unit: string): [boolean, number | undefined] {
    if (unit === undefined) {
        return [false, undefined];
    }

    let seconds = 0;
    let isValidSeconds = false;
    for (const regFactor of REGEX_FACTORS) {
        const mm = unit.match(regFactor.regex);
        if (mm) {
            isValidSeconds = true;
            seconds += parseInt(mm[1]) * regFactor.factor;
            unit = unit.replace(regFactor.regex, '');
        }
    }
    return [isValidSeconds, seconds];
}