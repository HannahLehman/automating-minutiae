
let request = require('request-promise');
let moment = require('moment');

let bodyData = (jql) => {
    return `{
      "expand": [
        "names",
        "schema",
        "operations"
      ],
      "jql": "${jql}",
      "fieldsByKeys": false,
      "fields": [
        "key",
        "summary",
        "status"
      ],
      "startAt": 0
    }`;
};

let buildRequest = (method, url, bodyData)  => {
    let options = {
        method: method,
        uri: `${url}`,
        auth: { username: process.env.JIRA_USERNAME, password: process.env.JIRA_PASSWORD },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: bodyData || null
    };

    return request(options)
        .then(function (response) {
            return response;
        })
        .catch(function (err) {
            console.log(`There was an error calling the Jira api with ${options.body}: ${err}`)
        });
};

let getVersions = async () => {
    let url = `${process.env.JIRA_VERSIONS_URL}`;
    let req = buildRequest('GET', url);
    let releases = {};

    await Promise.resolve(req).then(res => {
        let versions = JSON.parse(res).filter(version => !version.released);
        let today = moment().format('YYYY-MM-DD');

        let webVer = versions.find(x => !x.name.includes('mobile-') && x.startDate <= today && x.releaseDate >= today);
        let mobileVer = versions.find(x => x.name.includes('mobile-') && x.startDate <= today && x.releaseDate >= today);

        releases.web = webVer.name;

        if (mobileVer) {
            releases.mobile = mobileVer.name.replace('mobile-', '');
        } else {
            releases.mobile = null;
        }

        return;
    });

    return releases;
};

let getJQL = (jql) => {
    let body = bodyData(jql);
    let url = process.env.JIRA_SEARCH_URL;
    return buildRequest('POST', url, body);
};

let getMessage = async (jql) => {
    let message = {};
    message.blockedTix = [];

    // get total web tickets remaining
    await Promise.resolve(getJQL(jql.webAll)).then(res => {
        message.webTotal = JSON.parse(res).total;
        return;
    });

    // get web tickets blocking
    await Promise.resolve(getJQL(jql.webBlocked)).then(res => {
        message.webBlocked = JSON.parse(res).total;

        if (message.webBlocked > 0) {
            for(let i = 0; i < message.webBlocked; i++) {
                message.blockedTix.push(JSON.parse(res).issues[i].key)
            }
        }
        return;
    });

    if (!jql.mobileSkipped) {
        // get total mobile tickets remaining
        await Promise.resolve(getJQL(jql.mobileAll)).then(res => {
            message.mobileTotal = JSON.parse(res).total;
            return;
        });

        // get mobile tickets blocking
        await Promise.resolve(getJQL(jql.mobileBlocked)).then(res => {
            message.mobileBlocked = JSON.parse(res).total;

            if (message.mobileBlocked > 0) {
                for(let i = 0; i < message.mobileBlocked; i++) {
                    message.blockedTix.push(JSON.parse(res).issues[i].key)
                }
            }
            return;
        });
    } else {
        message.mobileSkipped = jql.mobileSkipped;
    };

    return message;
};

module.exports = {
    getVersions,
    getMessage
};