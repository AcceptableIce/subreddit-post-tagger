"use strict";

const EventEmitter = require("events");
const Logger = require("./Logger");
const secrets = require("../secrets.json");

module.exports = class ReportStream {
	constructor(snoowrap) {
		this.snoowrap = snoowrap;
		this.id = undefined;
		this.lastRequest = 0;
		this.event = new EventEmitter();

		this.query(snoowrap);
		this.id = setInterval(() => this.query(snoowrap), 30000);

		this.event.on("stop", () => clearInterval(this.id));
	}

	query() {
		this.snoowrap.getSubreddit(secrets.subredditName).getReports().then(reports => {
			this.event.emit("reports", reports.filter(x => x.created > this.lastRequest && x.mod_reports.length));
			this.lastRequest = Math.max(...reports.map(x => x.created));
		}).catch(error => {
			Logger.log("Unable to fetch reports.");
			Logger.reportError(error);
		});
	}
	
	on(event, callback) {
		this.event.on(event, callback);
	}
};