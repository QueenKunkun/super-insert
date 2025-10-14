import { searchInBuiltInSequences } from "./BuiltInSequences";
import { ISequnce, isNumber, IStep, parseNumber, InsertState } from "./core";
import * as vscode from 'vscode';
import { DateValue, isNow, isRandom, NumberValue, RandomValue } from "./Value";
import { OriginalTextRenderer, SequenceRenderer } from "./TextRenderers";
import { getSeconds } from "./unit";
import { FORMAT_DEFAULT_DATE, InsertSettngs } from "./InsertSettngs";
import { getPlugin } from "./TextRendererPlugins";
import { TextRenderer } from "../rose-formatter/src";

function extractAffixes(format: string): [string | undefined, string, string | undefined] {
    let prefix: string | undefined = undefined;
    let suffix: string | undefined = undefined;

    let fmt = format;

    const prefixMatch = format.match(/^\s*(\\.)+\s*/);
    if (prefixMatch) {
        prefix = prefixMatch[0].replace(/\\/g, '');
        fmt = fmt.substring(prefixMatch[0].length);
    }

    const suffixMatch = format.match(/\s*(\\.)+\s*$/);
    if (suffixMatch) {
        suffix = suffixMatch[0].replace(/\\/g, '');
        fmt = fmt.substring(0, fmt.length - suffixMatch[0].length);
    }

    return [prefix, fmt, suffix];
}

export async function parseUserInput(input: string | undefined, settings: InsertSettngs) {

    if (typeof input === 'undefined') {
        return undefined;
    }

    const setRenderer = (state: InsertState, format: string) => {
        const locale = settings.defaultLocale;
        [state.prefix, format, state.suffix] = extractAffixes(format);
        state.renderer = new TextRenderer(format, getPlugin(locale));
    }

    const defaultStart = settings?.getDefaultStart();
    const defaultStep = settings?.getDefaultStep();
    const defaultDateStep = settings?.getDefaultDateStep();

    const state: InsertState = {
        value: new NumberValue(defaultStart),
        step: 1,
        renderer: new OriginalTextRenderer()
    };

    if (!input) {
        return state;
    }

    // const [start, step, format] = input.split(/>?\\:/);
    const [start, ...rest] = input.split(/(?<!\\):/);

    if (typeof start === undefined) { return; }

    let _start = parseNumber(start);

    if (typeof _start === 'undefined' || isNaN(_start)) {

        // check if `start` is an item in some sequence or not
        const builtinFound = searchInBuiltInSequences(start);
        if (builtinFound.length > 0) {
            let seq = builtinFound[0];
            if (builtinFound.length > 1 && !settings._pickFirstOneWhenThereAreMoreThanOneCandidates) {
                const foundItems = builtinFound.map((x, i) => ({ label: `${i}.${x}`, sequence: x }) as vscode.QuickPickItem & { sequence: ISequnce });
                const pickedItem = await vscode.window.showQuickPick(foundItems, {
                    ignoreFocusOut: true,
                    matchOnDescription: true,
                    title: 'found more than one built-in sequence matches, please pick one',
                });
                if (typeof pickedItem === 'undefined') {
                    return;
                }
                seq = pickedItem.sequence;
            }

            if (seq) {
                state.renderer = new SequenceRenderer(seq);
                state.value = new NumberValue(seq.findIndex(start));
            }
        } else {

            if (isRandom(start)) {

                // e.g. []
                let [min, max] = rest.map(x => parseNumber(x));
                if (typeof max === 'undefined') {
                    max = min;
                    min = 0;
                }

                if (typeof max === 'undefined') {
                    max = 1;
                }

                if (typeof min === 'undefined') {
                    min = 0;
                }

                let format: string | undefined = rest.find(x => !isNumber(x));
                if (typeof format === 'undefined') {
                    if (typeof settings?.defaultRandomFormat !== 'undefined') {
                        setRenderer(state, settings?.defaultRandomFormat);
                    }
                } else {
                    setRenderer(state, format);
                }

                state.value = new RandomValue(min, max);
                return state;
            }

            state.value = new DateValue(new Date());
            if (isNow(start)) {
                // e.g. [now:yyyy-MM-dd hh\:mm\:ss]
                // or [now:1d:yyyy-MM-dd hh\:mm\:ss]
                let [valid, step] = getSeconds(rest[0]);
                let format = rest[0];
                if (valid && typeof step === 'number') {
                    format = rest[1];
                    state.step = step;
                } else {
                    state.step = defaultDateStep;
                }

                if (!format) {
                    format = settings?.defaultDateFormat ?? FORMAT_DEFAULT_DATE;
                }

                setRenderer(state, format);
                return state;
            }

            // e.g. [yyyy-MM-dd hh\:mm\:ss]
            setRenderer(state, start);
            state.step = defaultDateStep;
            return state;
        }
    } else {
        state.value = new NumberValue(_start);
    }

    let [step, format] = rest;
    let _step: IStep | undefined;
    if (typeof step !== 'undefined') { _step = parseNumber(step); }

    if (typeof format !== 'undefined') { setRenderer(state, format); }

    if (typeof _step === 'undefined' || isNaN(_step)) {
        if (typeof format === 'undefined' && typeof step === 'string') {
            setRenderer(state, step);
        }
        state.step = defaultStep;
    } else {
        state.step = _step;
    }

    return state;
}

