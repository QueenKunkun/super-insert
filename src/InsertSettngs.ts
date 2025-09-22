'use strict';
import * as vscode from 'vscode';
import { IInsertSettngs, IStep, Start } from './core';
import { parseUserInput } from './parseInput';
import { getSeconds } from './unit';

export type Shortcut = {
    input?: string,
    label?: string,
    format?: string,
    step?: number,
    start?: number,
}

export function fitText(text: string, fitToLength: number = 15, fillWith = " "): string {
    if (text) {
        if (text.length > fitToLength - 3) { return `${text.substring(0, fitToLength - 3)}...`; }
        return `${text}${new Array(fitToLength - text.length).fill(fillWith).join("")}`;
    }
    return text;
}

export function shortcutToDescription(shortcut: Shortcut) {
    const label = shortcut.label ? `${fitText(shortcut.label)}\t` : "";

    if (shortcut.format) {
        return `${label}(${shortcut.format} > ${shortcut.step})`;
    }

    return `${label}(${shortcut.input ?? ""})`;
}

export async function shortcutToSettings(shortcut: Shortcut, _settings: InsertSettngs) {
    const { input, format, start, step } = shortcut;
    if (typeof input !== 'undefined') { return await parseUserInput(input, _settings); }

    const list = [];

    if (typeof start !== 'undefined') { list.push(start); }

    if (typeof step !== 'undefined') { list.push(step); }

    if (typeof format !== 'undefined') { list.push(format); }

    return await parseUserInput(list.join(':'), _settings);
}

export function isValidShortcut(shortcut: Shortcut) {
    if (shortcut.format || typeof shortcut.start !== 'undefined') { return true; }
    if (shortcut.input) { return true; }
    return false;
}

interface CustomSequence { sequence?: string[], caseSensitive?: boolean }

export const FORMAT_DEFAULT_RANDOM = "[>=1]#"; // can be overwritten by vscode settings
export const FORMAT_DEFAULT_DATE = "yyyy-mm-dd"; // can be overwritten by vscode settings
export const DEFAULT_DATE_STEP = 3600 * 24; // default is 1d, can be overwritten by vscode settings
export const DEFAULT_START = 0;
export const DEFAULT_STEP = 1;

export class InsertSettngs implements IInsertSettngs {

    public defaultFormat: string | undefined;
    public start: Start | undefined;
    public step: number | undefined;
    public shortcuts: Shortcut[] | undefined;
    public customSequences: CustomSequence[] | undefined;

    public defaultRandomFormat: string | undefined;
    public defaultDateFormat: string | undefined;
    public defaultDateStep: IStep | undefined;

    private _disposable: vscode.Disposable;

    constructor() {
        let subscriptions: vscode.Disposable[] = [];
        vscode.workspace.onDidChangeConfiguration(this.updateSettings, this, subscriptions);
        this._disposable = vscode.Disposable.from(...subscriptions);

        this.updateSettings();
    }

    getDefaultStart() {
        return typeof this?.start === 'number' ? this?.start : DEFAULT_START;
    }

    getDefaultStep() {
        return typeof this?.step === 'undefined' ? DEFAULT_STEP : this?.step;
    }

    getDefaultDateStep() {
        return typeof this?.defaultDateStep !== 'undefined' ? this?.defaultDateStep : DEFAULT_DATE_STEP;
    }

    private updateSettings() {
        /**
         * Extract settings given a default value
         * @param key 
         * @param defaultValue 
         */
        const extractWithDefault = <T>(key: keyof this, defaultValue: T) => {
            (this as any)[key] = settings.get<T>(key as string) ?? defaultValue;
        };

        var settings = vscode.workspace.getConfiguration("superinsert");
        if (!settings) {
            return;
        }

        extractWithDefault("defaultFormat", "");
        extractWithDefault("defaultDateFormat", FORMAT_DEFAULT_DATE);
        extractWithDefault("defaultRandomFormat", undefined);

        const defaultDateStep = settings.get<string>("defaultDateStep");
        if (!defaultDateStep) {
            this.defaultDateStep = DEFAULT_DATE_STEP;
        } else {
            const [valid, seconds] = getSeconds(defaultDateStep);
            if (valid) {
                this.defaultDateStep = seconds;
            } else {
                this.defaultDateStep = DEFAULT_DATE_STEP;
            }
        }

        extractWithDefault<Start>("start", DEFAULT_START);
        extractWithDefault<number>("step", DEFAULT_STEP);
        extractWithDefault<Shortcut[]>("shortcuts", []);
        extractWithDefault<CustomSequence[]>("customSequences", []);
    }

    public dispose() {
        this._disposable.dispose();
    }
}
