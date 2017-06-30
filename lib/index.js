"use strict";

const Snoowrap = require("snoowrap");
const ReportStream = require("./ReportStream");
const RepoUpdater = require("./RepoUpdater");
const Templater = require("./Templater")
const Logger = require("./Logger");
const secrets = require("../secrets.json");

const reddit = new Snoowrap({
	userAgent: "subreddit-post-tagger",
	clientId: secrets.reddit.clientId,
	clientSecret: secrets.reddit.clientSecret,
	refreshToken: secrets.reddit.refreshToken
});

const templates = new Templater();

Logger.log("Waiting on reports...");

const stream = new ReportStream(reddit);

stream.on("reports", reports => {
	const addedIds = [];
	const newStyles = reports.reduce((acc, report) => {
		return acc + report.mod_reports.reduce((subAcc, modReport) => {
			const reportData = Object.assign({}, report);
			const [template, reportText] = modReport[0].split("!", 2);
			
			if(template && reportText) {
				if(templates.hasTemplate(template)) {
					reportData.report = reportText;
					reportData.reporter = modReport[1];
					addedIds.push(reportData.id);
					
					return `${subAcc}\n/**Begin ${reportData.id}**/\n${templates.applyTemplate(template, reportData)}\n/**End ${reportData.id}**/\n`;
				} else if(template === "clear") {
					addedIds.push(reportData.id);
					return "";
				} else {
					Logger.log(`Invalid template ${template}.`);
				}
			}

			return subAcc;
		}, "");
	}, "");

	if(newStyles.trim().length) {
		RepoUpdater.update(newStyles, addedIds).then(() => {
			Logger.log("Repository updated.");
		}).catch(error => {
			Logger.log("An error occured while trying to update the repository:");
			Logger.reportError(error);
		});
	}
});

