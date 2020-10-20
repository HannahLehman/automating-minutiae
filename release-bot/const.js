// Jira Query Language queries
const baseQuery = "project in (\'YOUR-PROJECT\', \'YOUR-PROJECT\') AND fixVersion = ";

let jql = (webVersion, mobileVersion) => {
  let queries = {
    webAll: `${baseQuery} ${webVersion} and status not in (Done, \'Pending Release\', \'Duplicate\', \'Will Not Fix\')`,
    webReady: `${baseQuery} ${webVersion} and status in (\'PM Review\', \'QA Test\', \'PR Complete\', \'QA Complete\', \'QA\', \'Release Testing\')`,
    webBlocked: `${baseQuery} ${webVersion} and status in (\'Defect Found\', \'In Progress\', \'Dev Ready\', \'Peer Review\', \'Dev In Progress\', \'New\', \'Backlog\', \'Needs Review\', \'Product Review\', \'Next\')`,
    mobileAll: `${baseQuery} twmobile-${mobileVersion} and status not in (Done, \'Pending Release\', \'Duplicate\', \'Will Not Fix\')`,
    mobileReady: `${baseQuery} twmobile-${mobileVersion} and status in (\'PM Review\', \'QA Test\', \'PR Complete\', \'QA Complete\', \'QA\', \'Release Testing\')`,
    mobileBlocked: `${baseQuery} twmobile-${mobileVersion} and status in (\'Defect Found\', \'In Progress\', \'Dev Ready\', \'Peer Review\', \'Dev In Progress\', \'New\', \'Backlog\', \'Needs Review\', \'Product Review\', \'Next\')`,
    mobileSkipped: false
  };

  if (!mobileVersion) {
    queries.mobileSkipped = true;
  };

  return queries;
};


module.exports = {
  jql
};