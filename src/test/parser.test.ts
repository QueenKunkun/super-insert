import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as parser from '../../rose-formatter/src/parse-format';
import { ParserTracer } from '../../rose-formatter/src/parse-format';
import { TextRenderer } from '../../rose-formatter/src';

class MyTracer implements ParserTracer {
	indentLevel = 0;

	trace(event: parser.ParserTracerEvent) {
		const that = this;
		function log(event: parser.ParserTracerEvent) {
			function repeat(string: string, n: number) {
				var result = "", i;

				for (i = 0; i < n; i++) {
					result += string;
				}

				return result;
			}

			function pad(string: string, length: number) {
				return string + repeat(" ", length - string.length);
			}

			if (typeof console === "object") {
				const lineInfo = pad(event.type, 10) + " "
					+ event.location.start.line + ":" + event.location.start.column + "-"
					+ event.location.end.line + ":" + event.location.end.column;
				console.log(
					repeat("  ", that.indentLevel) + event.rule
					+ '  #' + lineInfo
				);
			}
		}

		switch (event.type) {
			case "rule.enter":
				log(event);
				this.indentLevel++;
				break;

			case "rule.match":
				this.indentLevel--;
				log(event);
				break;

			case "rule.fail":
				this.indentLevel--;
				log(event);
				break;

			// default:
			// throw new Error("Invalid event type: " + event.type + ".");
		}
	}
}

suite.skip('Parser Test Sutie', function () {
	// vscode.window.showInformationMessage(`Start ${this.title}`);
	vscode.window.showInformationMessage(`Start!!!!`);

	test('Invalid Date format', function () {
		const format = "\"aa\"yyyy";
		// const tr = new TextRenderer(format);
		const res = parser.parse(format, { tracer: new MyTracer() });
		// tr.formatDate(new Date);
	});
});

