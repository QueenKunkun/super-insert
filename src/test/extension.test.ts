import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getSeconds } from '../unit';
import { TextRenderer } from '../../rose-formatter';

suite('Utils Test Sutie', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('getSeconds', () => {
		assert.strictEqual(86400, getSeconds('1d')[1]);
		assert.strictEqual(86400 + 3600, getSeconds('1d1h')[1]);
		assert.strictEqual(86400 + 3600 + 60, getSeconds('1d1h1m')[1]);
		assert.strictEqual(86400 + 3600 + 60 + 3, getSeconds('1d1h1m3s')[1]);
		assert.strictEqual(86400 + 3600 + 60 + 3 + 3, getSeconds('1d1h1m3s3')[1]);
		assert.strictEqual(3, getSeconds('3')[1]);
		assert.strictEqual(3, getSeconds('3s')[1]);
		assert.strictEqual(6, getSeconds('3s3')[1]);
	});
});

suite('Numbers Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test.skip('#,k', () => {
		const tr = new TextRenderer("#,k");
		assert.strictEqual("-4,000k", tr.formatNumber(-4000000));
		assert.strictEqual("-k", tr.formatNumber(-8.8));
		assert.strictEqual("-k", tr.formatNumber(-5.6));
		assert.strictEqual("-k", tr.formatNumber(-2.4));
		assert.strictEqual("k", tr.formatNumber(0.8));
		assert.strictEqual("k", tr.formatNumber(4));
		assert.strictEqual("k", tr.formatNumber(7.2));
	});
	test.skip('#.#,%', () => {
		const tr = new TextRenderer("#.#,%");
		assert.strictEqual("-400,000.%", tr.formatNumber(-4000000));
		assert.strictEqual("-0.9%", tr.formatNumber(-8.8));
		assert.strictEqual("-0.6%", tr.formatNumber(-5.6));
		assert.strictEqual("-0.2%", tr.formatNumber(-2.4));
		assert.strictEqual("0.1%", tr.formatNumber(0.8));
		assert.strictEqual("0.4%", tr.formatNumber(4));
		assert.strictEqual("0.7%", tr.formatNumber(7.2));
	});
	test('[h] m', () => {
		const tr = new TextRenderer("[h] m");

		assert.strictEqual("-96000000 0", tr.formatNumber(-4000000));
		assert.strictEqual("-212 48", tr.formatNumber(-8.8));
		assert.strictEqual("-135 36", tr.formatNumber(-5.6));
		assert.strictEqual("-58 24", tr.formatNumber(-2.4));
		assert.strictEqual("19 12", tr.formatNumber(0.8));
		assert.strictEqual("96 0", tr.formatNumber(4));
		assert.strictEqual("172 48", tr.formatNumber(7.2));
	});

	test('[h] m s', () => {
		const tr = new TextRenderer("[h] m s");
		console.log(tr.formatNumber(-4000000));
		console.log(tr.formatNumber(-8.8));
		console.log(tr.formatNumber(-5.6));
		console.log(tr.formatNumber(-2.4));
		console.log(tr.formatNumber(0.8));
		console.log(tr.formatNumber(4));
		console.log(tr.formatNumber(7.2));

		assert.strictEqual("-96000000 0 0", tr.formatNumber(-4000000));
		assert.strictEqual("-212 48 0", tr.formatNumber(-8.8));
		assert.strictEqual("-135 36 0", tr.formatNumber(-5.6));
		assert.strictEqual("-58 24 0", tr.formatNumber(-2.4));
		assert.strictEqual("19 12 0", tr.formatNumber(0.8));
		assert.strictEqual("96 0 0", tr.formatNumber(4));
		assert.strictEqual("172 48 0", tr.formatNumber(7.2));
	});
});
