const request = require('sync-request');
const consts = require('./const');
const jira = require('./jira');
const buildMessage = require('./message');
const testrail = require('./testrail');




async function main() {
  	console.log('API calls initiated...');

  	// Get versions
	let versions = await jira.getVersions();

	// Get TestRail regressions
    let trailProps = await testrail.getCounts(versions.web, versions.mobile);

	// Use versions to form Jira jql query
	let query = consts.jql(versions.web, versions.mobile);

	// Get Jira tickets
	let jiraProps = await jira.getMessage(query);
	let messageProps = {...jiraProps, ...trailProps};

	// Build Slack message
	let message = buildMessage.buildMessages(messageProps);

	// Do the damn thing.
	try {
		await request('POST', process.env.SLACK_WEBHOOK_URL, {
			json: {
				'text': message,
				'username': 'Release Bot'
			}
		});
		console.log('API calls finalized...');
	}
		catch(err) {
			console.log(`There was an error posting to the Slack api: ${err}`)
	}
};

exports.handler = main;
