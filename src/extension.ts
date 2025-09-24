// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SuperInserter } from './Inserter';
import { InsertSettngs } from './InsertSettngs';
import { registerSequences } from './BuiltInSequences';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "super-insert" is now active!');

	let settings = new InsertSettngs();
	let inserter = new SuperInserter(settings);

	if (typeof settings.customSequences !== 'undefined') {
		settings.customSequences.forEach(cs => {
			if (cs.sequence) {
				registerSequences(cs.sequence, !!cs.caseSensitive);
			}
		});
	}

	const disposable = vscode.commands.registerCommand('super-insert.base', () => {
		inserter.processInsert(context);
	});

	const shortcutDisposable = vscode.commands.registerCommand('super-insert.shortcut', () => {
		inserter.processShortcut(context);
	});

	const historyDisposable = vscode.commands.registerCommand('super-insert.history', () => {
		inserter.processHistory(context);
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(shortcutDisposable);
	context.subscriptions.push(historyDisposable);
	context.subscriptions.push(settings);
	context.subscriptions.push(inserter);
}

// This method is called when your extension is deactivated
export function deactivate() { }
