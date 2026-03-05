function buildStatusOutput(claudeInfo, locationInfo, separator, contextInfo, rateLimitInfo = null) {
    let output = `${claudeInfo} ${locationInfo} ${separator} ${contextInfo}`;
    if (rateLimitInfo) {
        output += `\n${rateLimitInfo}`;
    }
    return output;
}

module.exports = {
    buildStatusOutput
};
