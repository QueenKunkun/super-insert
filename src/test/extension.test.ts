import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getSeconds } from '../unit';
import { TextRenderer } from '../../rose-formatter/src';
import { SuperInserter } from '../Inserter';
import { InsertSettngs } from '../InsertSettngs';
import { parseUserInput } from '../parseInput';


suite('Sequence Generation Test', function () {
	vscode.window.showInformationMessage(`Start ${this.title}`);
	const settings = new InsertSettngs();

	const testWrapper = async (input: string, expected: string[]) => {
		settings._pickFirstOneWhenThereAreMoreThanOneCandidates = true;
		await generateSequences(settings, input, expected, true);
	}

	test('Numbers', async () => {
		await testWrapper("4000:0.5:#", ["4000", "4001", "4001",]);
		await testWrapper("4000:0.5:0,0.##", ["4,000.", "4,000.5", "4,001.",]);
		await testWrapper("4000:0.5:0.00", ["4000.00", "4000.50", "4001.00",]);
		await testWrapper("1:0.5:00.00", ["01.00", "01.50", "02.00",]);
		await testWrapper("1:0.5:#.##", ["1.", "1.5", "2.",]);
		await testWrapper("1:0.5:#/#", ["1/1", "3/2", "2/1",]);
		await testWrapper("1:0.5:#/40", ["40/40", "60/40", "80/40",]);
		await testWrapper("4000:0.5:#,k", ["4k", "4k", "4k",]);
		await testWrapper("4000:0.5:0,#,k", ["04k", "04k", "04k",]);
		await testWrapper("4000:0.5:#.#%", ["400000.%", "400050.%", "400100.%",]);
		await testWrapper("4000:0.5:#,0.#%", ["400,000.%", "400,050.%", "400,100.%",]);
		await testWrapper("4000:0.5:,#.#-,", [",4000.-,", ",4000.5-,", ",4001.-,",]);
		await testWrapper("4000:0.5:%#.#", ["%400000.", "%400050.", "%400100.",]);
		await testWrapper("4000:0.5:0.00E+00", ["4.00E+03", "4.00E+03", "4.00E+03",]);
		await testWrapper("4000:0.5:0.00E-0", ["4.00E3", "4.00E3", "4.00E3",]);
		await testWrapper("4000:0.5:##.#E-0", ["40.E2", "40.E2", "40.E2",]);
		await testWrapper("4000:0.5:#-#.#", ["400-0.", "400-0.5", "400-1.",]);
		await testWrapper("4000:0.5:#\"abc\"#.#", ["400abc0.", "400abc0.5", "400abc1.",]);
		await testWrapper("4000:0.5:#中#.#", ["400中0.", "400中0.5", "400中1.",]);
		await testWrapper("4000:0.5:[h]", ["96000", "96012", "96024",]);
		await testWrapper("4000:0.5:[m]", ["5760000", "5760720", "5761440",]);
		await testWrapper("4000:0.5:[h] m", ["96000 0", "96012 0", "96024 0",]);
		await testWrapper("4000:0.5:[h] m s", ["96000 0 0", "96012 0 0", "96024 0 0",]);
		await testWrapper("1.5:0.5:[%1]#;#.#0", ["1.50", "2", "2.50",]);
	});

	/**
	 * Skipped because the output depends on the current date
	 */
	test.skip('Dates', async () => {
		await testWrapper("now:yyyy/m/d hh\:mm\:ss", ["2025/9/26 10:17:46", "2025/9/27 10:17:46", "2025/9/28 10:17:46",]);
		await testWrapper("now:yyyy-mm-dd hhmmss", ["2025-09-26 101746", "2025-09-27 101746", "2025-09-28 101746",]);
		await testWrapper("now:ddd, mmm dd - yyyy", ["Fri, Sep 26 - 2025", "Sat, Sep 27 - 2025", "Sun, Sep 28 - 2025",]);
		await testWrapper("now:dddd, dd of mmmm of yyyy", ["Friday, 26 of September of 2025", "Saturday, 27 of September of 2025", "Sunday, 28 of September of 2025",]);
		await testWrapper("now:m/d/yyyy h\:mm AM/PM", ["9/26/2025 10:17 am", "9/27/2025 10:17 am", "9/28/2025 10:17 am",]);
		await testWrapper("now:hham/pm", ["10am", "10am", "10am",]);
		await testWrapper("now:hh a/p mm", ["10 a 17", "10 a 17", "10 a 17",]);
	});

	test('Sequences', async () => {
		await testWrapper("Sun", ["Sun", "Mon", "Tue",]);
		await testWrapper("Sunday", ["Sunday", "Monday", "Tuesday",]);
		await testWrapper("Do", ["Do", "Re", "Mi",]);
		await testWrapper("周日", ["周日", "周一", "周二",]);
		await testWrapper("A", ["A", "B", "C",]);
		await testWrapper("c", ["c", "d", "e",]);
		await testWrapper("零", ["零", "一", "二",]);
		await testWrapper("金牛", ["金牛", "双子", "巨蟹",]);
		await testWrapper("谷雨", ["谷雨", "立夏", "小满",]);
		await testWrapper("戊寅", ["戊寅", "己卯", "庚辰",]);
		await testWrapper("种", ["种", "域", "界",]);
		await testWrapper("紫", ["紫", "红", "橙",]);
	});
});

suite.skip('Utils Test Sutie', function () {
	vscode.window.showInformationMessage(`Start ${this.title}`);

	test('getSeconds', function () {
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


suite.skip('Formatter Test Suite', function () {
	vscode.window.showInformationMessage(`Start ${this.title}`);

	test('#,k', () => {
		const tr = new TextRenderer("#,k");
		assert.strictEqual("-4,000k", tr.formatNumber(-4000000));
		assert.strictEqual("-k", tr.formatNumber(-8.8));
		assert.strictEqual("-k", tr.formatNumber(-5.6));
		assert.strictEqual("-k", tr.formatNumber(-2.4));
		assert.strictEqual("k", tr.formatNumber(0.8));
		assert.strictEqual("k", tr.formatNumber(4));
		assert.strictEqual("k", tr.formatNumber(7.2));
	});
	test('0.#,%', () => {
		const tr = new TextRenderer("0.#,%");
		assert.strictEqual("-400,000.%", tr.formatNumber(-4000000));
		assert.strictEqual("-0.9%", tr.formatNumber(-8.8));
		assert.strictEqual("-0.6%", tr.formatNumber(-5.6));
		assert.strictEqual("-0.2%", tr.formatNumber(-2.4));
		assert.strictEqual("0.1%", tr.formatNumber(0.8));
		assert.strictEqual("0.4%", tr.formatNumber(4));
		assert.strictEqual("0.7%", tr.formatNumber(7.2));
	});

	test('#.#,%', () => {
		const tr = new TextRenderer("#.#,%");
		assert.strictEqual("-400,000.%", tr.formatNumber(-4000000));
		assert.strictEqual("-.9%", tr.formatNumber(-8.8));
		assert.strictEqual("-.6%", tr.formatNumber(-5.6));
		assert.strictEqual("-.2%", tr.formatNumber(-2.4));
		assert.strictEqual(".1%", tr.formatNumber(0.8));
		assert.strictEqual(".4%", tr.formatNumber(4));
		assert.strictEqual(".7%", tr.formatNumber(7.2));
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

function collectResults(it: Iterator<string>, count: number) {
	const results: string[] = [];
	for (let i = 0; i < count; i++) {
		const { done, value } = it.next();
		if (done) break;
		results.push(value);
	}
	return results;
}

/**
 * Generate sequences according to the user input, and compare the results with expected results or log out test code examples.
 * @param settings 
 * @param userInput 
 * @param expected 
 * @param assertResult 
 */
async function generateSequences(settings: InsertSettngs, userInput: string, expected: string[], assertResult: boolean) {
	const state = await parseUserInput(userInput, settings);
	if (state) {
		const inserter = new SuperInserter(settings);
		const it = inserter.generateSequences(state, expected.length);
		if (assertResult) {
			for (const exp of expected) {
				const { done, value } = it.next();
				assert.strictEqual(exp, value);
			}
		} else {
			// const results = collectResults(it, expected.length);
			const results = Array.from(it);
			console.log(`await testSeqGen("${userInput}", [${results.map(x => `"${x.replace("\"", "\\\"")}", `).join("")}]);`);
		}
	}
}

