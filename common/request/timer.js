//source - https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API/Using_the_Resource_Timing_API
const logLoadTimes = ()=>{
    // Check performance support
    if (performance === undefined) {
        console.log("= Calculate Load Times: performance NOT supported");
        return {};
    }

    // Get a list of "resource" performance entries
    var resources = performance.getEntriesByType("resource");
    if (resources === undefined || resources.length <= 0) {
        console.log("= Calculate Load Times: there are NO `resource` performance records");
        return;
    }

    console.log("= Calculate Load Times");
    for (var i=0; i < resources.length; i++) {
        console.log("== Resource[" + i + "] - " + resources[i].name);
        // Redirect time
        var t = resources[i].redirectEnd - resources[i].redirectStart;
        console.log("... Redirect time = " + t);

        // DNS time
        t = resources[i].domainLookupEnd - resources[i].domainLookupStart;
        console.log("... DNS lookup time = " + t);

        // TCP handshake time
        t = resources[i].connectEnd - resources[i].connectStart;
        console.log("... TCP time = " + t);

        // Secure connection time
        t = (resources[i].secureConnectionStart > 0) ? (resources[i].connectEnd - resources[i].secureConnectionStart) : "0";
        console.log("... Secure connection time = " + t);

        // Response time
        t = resources[i].responseEnd - resources[i].responseStart;
        console.log("... Response time = " + t);

        // Fetch until response end
        t = (resources[i].fetchStart > 0) ? (resources[i].responseEnd - resources[i].fetchStart) : "0";
        console.log("... Fetch until response end time = " + t);

        // Request start until reponse end
        t = (resources[i].requestStart > 0) ? (resources[i].responseEnd - resources[i].requestStart) : "0";
        console.log("... Request start until response end time = " + t);

        // Start until reponse end
        t = (resources[i].startTime > 0) ? (resources[i].responseEnd - resources[i].startTime) : "0";
        console.log("... Start until response end time = " + t);
    }
}

//TODO needs to be fixed response times are not correct
function getLastRequestTiming(){
    // Check performance support
    if (performance === undefined) {
        console.log("= Calculate Load Times: performance NOT supported");
        return {};
    }

    // Get a list of "resource" performance entries
    var resources = performance.getEntriesByType("resource");
    if (resources === undefined || resources.length <= 0) {
        console.log("= Calculate Load Times: there are NO `resource` performance records");
        return;
    }
    logLoadTimes();
    const resource = resources[resources.length - 1];
    const {name, redirectStart, redirectEnd, domainLookupEnd, domainLookupStart, connectEnd, connectStart,
        secureConnectionStart, responseStart, responseEnd, startTime, requestStart, fetchStart} = resource;

        const redirectTime = redirectEnd - redirectStart;
        const dns = domainLookupEnd - domainLookupStart;
        const connect = connectEnd - connectStart;
        const ssl = secureConnectionStart > 0 ? connectEnd - secureConnectionStart : 0;
        const responseTime = responseEnd - responseStart;
        const total = fetchStart > 0 ? responseEnd - fetchStart : 0;
        return {
            dns, connect, ssl, receive: responseTime, total,
        }
}


module.exports = {
    logLoadTimes, getLastRequestTiming
}
