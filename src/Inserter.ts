'use strict';
import * as vscode from 'vscode';
import { InsertSettngs, isValidShortcut, shortcutToState, Shortcut, DEFAULT_STEP, DEFAULT_START } from './InsertSettngs';
import { InsertState } from './core';
import { parseUserInput } from './parseInput';
import { getInputHistory, saveInputHistory } from './history';
import { createQuickPick } from './quickPick';

// hack for new line
const LN_BR = "\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000";

function getUserInput(value?: string, settings?: InsertSettngs | undefined) {
    const defaultStart = settings?.getDefaultStart();
    const defaultStep = settings?.getDefaultStep();

    const opt: vscode.InputBoxOptions = {
        ignoreFocusOut: true,
        placeHolder: `(default) ${defaultStart}:${defaultStep}`,
        value,
        prompt: "Input start or start:format or start:step or start:step:format, start can be a number or 'now', 'rand' or a pre-defined sequence item."
            + ` examples: '1:1:00#', 'rand:1:100:00#', 'now:yyyy-mm-dd'`
            + `. `,
        // + `format syntax please refer to excel's cell format, i.e. the TEXT() function`
        valueSelection: value ? [0, 0] : undefined,
    };

    const input = vscode.window.showInputBox(opt);
    return input;
}

export class SuperInserter {

    private _settings: InsertSettngs;

    constructor(settings: InsertSettngs) {
        this._settings = settings;
    }

    // make public for testing only
    public *generateSequences(state: InsertState, count?: number) {

        let { value, step, renderer } = state;

        if (typeof value === 'undefined') {
            return;
        }

        if (typeof step === 'undefined') {
            step = 1;
        }

        if (typeof value === 'undefined') {
            return;
        }

        const condition = typeof count === 'number' ? (i: number) => i < count : (i: number) => true;

        for (let i = 0; condition(i); i++) {
            const str = value.format(renderer);
            yield str;
            value = value.next(step);
        }
    }

    private insertSequences(state: InsertState) {

        let textEditor = vscode.window.activeTextEditor;
        if (!textEditor) { return; }

        const that = this;

        const selections = textEditor.selections;

        textEditor.edit(function (builder) {
            const it = that.generateSequences(state);

            for (let i = 0; i < selections.length; i++) {
                const { done, value } = it.next();
                if (!done) {
                    builder.replace(selections[i], value);
                }
            }
        });
    }

    async processInsert(context: vscode.ExtensionContext) {
        const input = await getUserInput(undefined, this._settings);

        if (typeof input !== 'undefined') {
            saveInputHistory(context, input);
        }

        let state = await parseUserInput(input, this._settings);

        if (!state) {
            return;
        }

        await this.insertSequences(state);
    }

    async processShortcut(context: vscode.ExtensionContext) {
        const avaiableShortcuts = this._settings.shortcuts?.filter(isValidShortcut);
        if (typeof avaiableShortcuts === 'undefined') {
            return;
        }

        const items = avaiableShortcuts.map(shortcut =>
            ({ label: shortcut.label, detail: shortcut.input, shortcut }) as vscode.QuickPickItem & { shortcut: Shortcut });

        const pickedItem = await vscode.window.showQuickPick(items, {
            ignoreFocusOut: true,
            matchOnDetail: true,
            matchOnDescription: true,
            title: 'Pick a shortcut input that createed via vscode user settings',
        });

        if (typeof pickedItem !== 'undefined') {
            const state = await shortcutToState(pickedItem.shortcut, this._settings);
            if (state) {
                await this.insertSequences(state);
            }
        }
    }

    async processHistory(context: vscode.ExtensionContext) {
        const history = getInputHistory(context);
        if (typeof history === 'undefined') { return; }
        const pickedItems = await createQuickPick({ items: history.reverse(), title: "pick a history", clickItemToEdit: true });
        if (!pickedItems || pickedItems.length === 0) { return; }
        const pickedItem = pickedItems[0];
        const { label, editClicked } = pickedItem;

        // const pickedItem = await vscode.window.showQuickPick(history.reverse(), {
        //     ignoreFocusOut: true,
        //     matchOnDescription: true,
        //     title: 'Pick a history input to run',
        // });

        let _label: string | undefined = label;
        if (editClicked) {
            _label = await getUserInput(label, this._settings);
            if (typeof _label === 'undefined') {
                return;
            }
        }

        if (typeof _label !== 'undefined') { saveInputHistory(context, _label); }

        const state = await parseUserInput(_label, this._settings);
        if (typeof state !== 'undefined') {
            await this.insertSequences(state);
        }
    }

    public dispose() {
        this._settings.dispose();
    }
}
