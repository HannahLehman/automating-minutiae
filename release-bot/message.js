let buildMessages = (messageProps) => {
    let messages = {};
    messages.webMessage = "";
    messages.mobileMessage = "";

    if(messageProps.webTotal != 0 && messageProps.webUntested != 0){
        messages.webMessage = `*Web ${messageProps.webVersion}*:\n* There are ${messageProps.webTotal} tickets and ${messageProps.webUntested } regressions remaining.
        * There are ${messageProps.webBlocked} tickets blocking.\n`;
    } else if(messageProps.webTotal != 0 && messageProps.webUntested == 0){
        messages.webMessage = `*Web ${messageProps.webVersion}*:\n* There are ${messageProps.webTotal} tickets and regression testing has not started yet.
        * There are ${messageProps.webBlocked} tickets blocking.\n`;
    } else {
        messages.webMessage = `*Web ${messageProps.webVersion}* has no remaining tickets or regressions, and is *APPROVED*.`;
    }

    if (messageProps.mobileSkipped) {
        messages.mobileMessage = "*There is no mobile work being done at this time.*"
    } else if (typeof messageProps.mobileUntested == "string") {
        messages.mobileMessage = `*Mobile ${messageProps.mobileUntested}*`
    } else if(messageProps.mobileTotal != 0 && messageProps.mobileUntested != 0) {
        messages.mobileMessage = `*Mobile ${messageProps.mobileVersion}*:\n* There are ${messageProps.mobileTotal} tickets and ${messageProps.mobileUntested} regressions remaining.
	    * There are ${messageProps.mobileBlocked} tickets blocking.`;
    } else if(messageProps.mobileTotal != 0 && messageProps.mobileUntested == 0){
        messages.mobileMessage = `*Mobile ${messageProps.mobileVersion}*:\n* There are ${messageProps.mobileTotal} tickets and regression testing has not started yet.
        * There are ${messageProps.mobileBlocked} tickets blocking.\n`;
    } else {
        messages.mobileMessage = `*Mobile ${messageProps.mobileVersion}* has no remaining tickets or regressions, and is *APPROVED*.`;
    }

    let blockedTix = messageProps.blockedTix.join(', ');
    messages.blockedMessages = messageProps.blockedTix.length > 0 ? `* *${blockedTix}* is/are still marked as blocking.\n` : "";

    console.log(`${messages.webMessage}\n\n ${messages.mobileMessage}\n\n ${messages.blockedMessages}`);
    return `${messages.webMessage}\n\n ${messages.mobileMessage}\n\n ${messages.blockedMessages}`;
};

module.exports = {
    buildMessages
};