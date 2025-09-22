import * as vscode from 'vscode';


const KEY_HISTORY = "history";

export function saveInputHistory(context: vscode.ExtensionContext, input: string) {
    let history = context.globalState.get<string[]>(KEY_HISTORY);
    if (typeof history === 'undefined') {
        history = [];
    }
    const idx = history.findIndex(x => x === input);

    // if found, then at it to the last
    if (idx > -1) {
        // already the last one, do nothing
        if (idx === history.length - 1) {
            return;
        }

        history.splice(idx, 1);
    }

    history.push(input);
    context.globalState.update(KEY_HISTORY, history);
}

export function getInputHistory(context: vscode.ExtensionContext) {
    let history = context.globalState.get<string[]>(KEY_HISTORY);
    if (typeof history === 'undefined') {
        history = [];
    }
    return history;
}