"use strict";

const fs = require("fs");
const path = require("path");
const Logger = require("./Logger");

module.exports = class Templater {
	constructor() {
		this.templates = {};

		const templateDir = path.join(__dirname, "..", "templates");
		
		fs.readdirSync(templateDir).forEach(filename => {
			const templateName = path.basename(filename, path.extname(filename));

			this.templates[templateName] = fs.readFileSync(path.join(templateDir, filename)).toString();
		});

		Logger.log(`${Object.keys(this.templates).length} template(s) loaded!`);
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