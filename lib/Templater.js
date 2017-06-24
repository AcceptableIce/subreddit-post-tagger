"use strict";

const fs = require("fs");
const path = require("path");
const Logger = require("./Logger");

module.exports = class Templater {
	constructor() {
		this.templates = {};

		const templateDir = path.join(__dirname, "..", "templates");
		let aliasCount = 0;

		fs.readdirSync(templateDir).forEach(filename => {
			const templateNames = [path.basename(filename, path.extname(filename))];
			let templateBody = fs.readFileSync(path.join(templateDir, filename)).toString();
			
			// Find the aliases, and remove them from the template body.
			templateBody = templateBody.replace(/^@alias #([a-zA-Z0-9-_]+)$/gmi, (match, aliasName) => {
				templateNames.push(aliasName);
				aliasCount += 1;

				return "";
			}).trim();

			templateNames.forEach(templateName => {
				this.templates[templateName] = templateBody;
			});
		});

		const templateCount = Object.keys(this.templates).length;

		Logger.log(`${templateCount} template${templateCount === 1 ? "" : "s"} loaded (${aliasCount} alias${aliasCount === 1 ? "" : "es"})`);
	}

	hasTemplate(template) {
		return this.templates.hasOwnProperty(template);
	}

	applyTemplate(template, values) {
		return this.templates[template].replace(/{{([^{}]+)}}/g, (match, m1) => {
			return values[m1] || m1;
		});
	}
};