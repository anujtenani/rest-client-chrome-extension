const {charsetFromType, charsetFromHeaders} = require('./mimefunc');
const {DataUriToBlob, BlobToText, BlobToDataUri} = require('./blobfunc');

XMLHttpRequest.prototype.wrappedSetRequestHeader =
    XMLHttpRequest.prototype.setRequestHeader;

// Override the existing setRequestHeader function so that it stores the headers
XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    // Call the wrappedSetRequestHeader function first
    // so we get exceptions if we are in an erronous state etc.
    this.wrappedSetRequestHeader(header, value);
    // Create a headers map if it does not exist
    if(!this.reqheaders) {
        this.reqheaders = {};
    }
    // Create a list for the header that if it does not exist
    this.reqheaders[header] = value;
}

async function parseResponseObject(requestObject, response){
    const {headers, status, statusText, data, request} = response;
    const blob = data;
    const charset = blob.type ? charsetFromType(blob.type) : charsetFromHeaders(headers);
    const body = charset ? await BlobToText(blob) : await BlobToDataUri(blob);
    return {headers, href: requestObject.url, method: requestObject.method, statusCode: status, statusText, body, requestHeaders:request.reqheaders};

}
module.exports = {
    parseResponseObject
}
