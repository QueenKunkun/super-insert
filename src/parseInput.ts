import { searchInBuiltInSequences } from "./BuiltInSequences";
import { ISequnce, isNumber, IStep, parseNumber, SequenceSetting } from "./core";
import * as vscode from 'vscode';
import { DateValue, isNow, isRandom, NumberValue, RandomValue } from "./Value";
import { OriginalTextRenderer, SequenceRenderer } from "./TextRenderers";
import { TextRenderer } from "@datadocs/rose-formatter";
import { getSeconds } from "./unit";
import { FORMAT_DEFAULT_DATE, FORMAT_DEFAULT_RANDOM, InsertSettngs, DEFAULT_DATE_STEP, DEFAULT_START, DEFAULT_STEP } from "./InsertSettngs";

export async function parseUserInput(input: string | undefined, _settings: InsertSettngs) {

    if (typeof input === 'undefined') {
        return undefined;
    }

    const defaultStart = _settings?.getDefaultStart();
    const defaultStep = _settings?.getDefaultStep();
    const defaultDateStep = _settings?.getDefaultDateStep();

    const settings: SequenceSetting = {
        value: new NumberValue(defaultStart),
        step: 1,
        formatter: new OriginalTextRenderer()
    };

    if (!input) {
        return settings;
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
            if (builtinFound.length > 1) {
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
                settings.formatter = new SequenceRenderer(seq);
                settings.value = new NumberValue(seq.findIndex(start));
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
                    if (typeof _settings?.defaultRandomFormat !== 'undefined') {
                        settings.formatter = new TextRenderer(_settings?.defaultRandomFormat);
                    }
                } else {
                    settings.formatter = new TextRenderer(format);
                }

                settings.value = new RandomValue(min, max);
                return settings;
            }

            settings.value = new DateValue(new Date());
            if (isNow(start)) {
                // e.g. [now:yyyy-MM-dd hh\:mm\:ss]
                // or [now:1d:yyyy-MM-dd hh\:mm\:ss]
                let [valid, step] = getSeconds(rest[0]);
                let format = rest[0];
                if (valid && typeof step === 'number') {
                    format = rest[1];
                    settings.step = step;
                } else {
                    settings.step = defaultDateStep;
                }

                if (!format) {
                    format = _settings?.defaultDateFormat ?? FORMAT_DEFAULT_DATE;
                }

                settings.formatter = new TextRenderer(format);
            } else {
                // e.g. [yyyy-MM-dd hh\:mm\:ss]
                settings.formatter = new TextRenderer(start);
                settings.step = defaultDateStep;
            }
            return settings;
        }
    } else {
        settings.value = new NumberValue(_start);
    }

    let [step, format] = rest;
    let settings_step: IStep | undefined;
    if (typeof step !== 'undefined') { settings_step = parseNumber(step); }

    if (typeof format !== 'undefined') { settings.formatter = new TextRenderer(format); }

    if (typeof settings_step === 'undefined' || isNaN(settings_step)) {
        if (typeof format === 'undefined' && typeof step === 'string') {
            settings.formatter = new TextRenderer(step);
        }
        settings.step = defaultStep;
    } else {
        settings.step = settings_step;
    }

    return settings;
}