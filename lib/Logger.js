"use strict";

module.exports = class Logger {
	static log(message) {
		console.log(`[subreddit-post-tagger] ${message}`);
	}

	static reportError(error) {
		console.log(error);
	}
};