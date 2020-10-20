let request = require('request-promise');


let trRequest = (endpoint) => {
    // TODO Save vars in ansible?
    let username = process.env.TESTRAIL_USERNAME;
    let password = process.env.TESTRAIL_PASSWORD;
    let auth = "Basic " + Buffer.from(username + ":" + password).toString("base64");
    let path = endpoint;

    let options = {
        method: 'GET',
        url: `https://YOUR-ORG.testrail.io/index.php?/api/v2/${path}`,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': auth
        }
    };

    return request(options)
        .then(function (response) {
            return JSON.parse(response);
        })
        .catch(function (err) {
            console.log(`There was an error calling the TestRail api with ${options}: ${err}`)
        });
};

let countUntested = (response, filterName) => {
    let runs = response.filter(run => run.name.includes(filterName));
    let totalUntested = 0;
    if (runs.length) {
        runs.forEach(run => totalUntested = totalUntested + run.untested_count);
    } else {
        totalUntested = `${filterName} Milestone has not been created in TestRail!`
    }
    return totalUntested;
};

let getCounts = async (webVersion, mobileVersion) => {
    let message = {};
    message.webVersion = webVersion;
    message.mobileVersion = mobileVersion;

    // get project IDs
    await trRequest('get_projects').then(response => {
        message.webId = response.find(proj => proj.name.includes('Web')).id;
        message.mobileId = response.find(proj => proj.name.includes('Mobile')).id;
        return message;
    });

    // get web untested
    await trRequest(`get_runs/${message.webId}`).then(response => {
        message.webUntested = countUntested(response, webVersion);
        return message;
    });

    // get mobile untested
    await trRequest(`get_runs/${message.mobileId}`).then(response => {
        message.mobileUntested = countUntested(response, mobileVersion);
        return message;
    });

    return message;
};

module.exports = {
    getCounts
};

