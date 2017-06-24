"use strict";

const Logger = require("./Logger");
const path = require("path");
const fs = require("fs");
const remove = require("remove");
const Git = require("nodegit");
const secrets = require("../secrets.json");
const execSync = require("child_process").execSync;

module.exports = class RepoUpdater {
	static update(additionalCSS, addedIds) {
		Logger.log("Updating repository with new tags...");

		return new Promise((resolve, reject) => {
			const repoDir = path.join(__dirname, "..", "repo");
					
			if(fs.existsSync(repoDir)) {
				remove.removeSync(repoDir);
			}

			const gitOptions = {
				fetchOpts: {
					callbacks: {
						certificateCheck: () => 1,
						credentials: function() {
							return Git.Cred.userpassPlaintextNew(secrets.githubToken, "x-oauth-basic");
						}
					}
				}
			};

			Git.Clone.clone(secrets.repository, repoDir, gitOptions).then(async repo => {
				const tagFile = path.join(repoDir, secrets.tagFile);

				let fileContents = fs.readFileSync(tagFile).toString();
				const originalContents = fileContents;

				// Clear any old styles
				addedIds.forEach(id => {
					fileContents = fileContents.replace(new RegExp(`/\\*\\*Begin ${id}\\*\\*/[\\s\\S]*?\\*\\*End ${id}\\*\\*/`, "gm"), "");
				});

				fileContents = fileContents.trim() + additionalCSS;

				fs.writeFileSync(tagFile, fileContents);

				if(fileContents === originalContents) {
					Logger.log("No changes were made, skipping commit.");
				} else {
					try {
						execSync(`git add ${tagFile}`, { cwd: repoDir });
						execSync(`git commit -m "Update post tags."`, { cwd: repoDir });
						execSync("git push", { cwd: repoDir });
						resolve();
					} catch(e) {
						reject(e);
					}
				}
			});
		});
	}
};