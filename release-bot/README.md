# Release Bot

Slack bot that sends the daily release update via the Jira and Testrail APIs, using Slack's Webhooks app and Serverless to invoke it within an AWS Lamda function.

## AWS Lamda

The application is served up on a schedule, running at 7am EST, daily. It can be found [here, in the AWS Console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/applications/release-bot-dev).


## Local Execution

The environment variables needed to invoke this locally are as follows. The values can be found in the AWS Console -> Functions -> release-bot-dev.
SLACK_TOKEN
SLACK_WEBHOOK_URL
JIRA_URL
JIRA_USERNAME
JIRA_PASSWORD
TESTRAIL_USERNAME
TESTRAIL_PASSWORD

Install dependencies:
`npm install`

Invoke function:
`serverless invoke local --function handler`