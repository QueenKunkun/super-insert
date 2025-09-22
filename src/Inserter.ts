'use strict';
import * as vscode from 'vscode';
import { InsertSettngs, isValidShortcut, shortcutToSettings, Shortcut, DEFAULT_STEP, DEFAULT_START } from './InsertSettngs';
import { SequenceSetting } from './core';
import { parseUserInput } from './parseInput';
import { getInputHistory, saveInputHistory } from './history';
import { createQuickPick } from './quickPick';

// hack for new line
const LN_BR = "\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000";

function getInsertUserInput(value?: string, _settings?: InsertSettngs | undefined) {
    const defaultStart = _settings?.getDefaultStart();
    const defaultStep = _settings?.getDefaultStep();

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

export class SequenceInserter {

    private _settings: InsertSettngs;

    constructor(settings: InsertSettngs) {
        this._settings = settings;
    }

    private insertSequences(settings: SequenceSetting) {
        let textEditor = vscode.window.activeTextEditor;
        if (!textEditor) { return; }

        const selections = textEditor.selections;

        let { value, step, formatter } = settings;

        if (typeof value === 'undefined') {
            return;
        }

        if (typeof step === 'undefined') {
            step = 1;
        }

        textEditor.edit(function (builder) {

            if (typeof value === 'undefined') {
                return;
            }

            for (let i = 0; i < selections.length; i++) {
                const str = value.format(formatter);
                builder.replace(selections[i], str);
                value = value.next(step);
            }
        });
    }

    async processInsert(context: vscode.ExtensionContext) {
        const val = await getInsertUserInput(undefined, this._settings);

        let newSettings = await parseUserInput(val, this._settings);

        if (!newSettings) {
            return;
        }
        if (typeof val !== 'undefined') {
            saveInputHistory(context, val);
        }

        await this.insertSequences(newSettings);
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
            const newSettings = await shortcutToSettings(pickedItem.shortcut, this._settings);
            if (newSettings) {
                await this.insertSequences(newSettings);
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
            _label = await getInsertUserInput(label, this._settings);
            if (typeof _label === 'undefined') {
                return;
            }
        }

        const newSettings = await parseUserInput(_label, this._settings);
        if (typeof newSettings !== 'undefined') {
            if (typeof _label !== 'undefined') { saveInputHistory(context, _label); }
            await this.insertSequences(newSettings);
        }
    }

    public dispose() {
        this._settings.dispose();
    }
}
