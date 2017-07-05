#!/usr/bin/env node

"use strict";
const exec = require("child_process").exec;

exec("eval `ssh-agent -s`; ssh-add; ssh-add -l", (err, stdout, stderr) => {
	if(err) {
		console.error(err);
	} else {
		console.log(stdout);
	        require("../lib/index.js");
	}
});
