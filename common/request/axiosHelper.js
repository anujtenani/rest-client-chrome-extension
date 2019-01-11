const {charsetFromType, charsetFromHeaders} = require('./mimefunc');
const {DataUriToBlob, BlobToText, BlobToDataUri} = require('./blobfunc');
const axios = require('axios');

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


async function executeAxios(url, method, headers, body, auth){
    const requestObject = {
        url,
        method,
        headers,
//        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        withCredentials: 'omit', // include, *same-origin, omit
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        auth,
        responseType:'blob'
    }

    const {bodyType, data} = body;
    switch (bodyType) {
        case "text":
            requestObject.data = data;
            requestObject.headers['Content-Type'] = 'text/plain';
            break;
        case "json":
            requestObject.data = data;
            requestObject.headers['Content-Type'] = 'application/json';
            break;
        case "binary":
            requestObject.data = DataUriToBlob(data.datauri);
            requestObject.headers['Content-Type'] = requestObject.data.type;
            break;
        case "graphql":
            requestObject.data = JSON.stringify({query:data});
            requestObject.headers['Content-Type'] = 'application/json';
            break;
        case "form":
            requestObject.data = createFormBody(body.params);
            requestObject.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            break;
        case "multipart":
            requestObject.data =  createMultipartBody(body.params);
    }
    requestObject.headers['Cache-Control'] = 'no-cache';

    // generate response and request headers promise
    const requestCancelToken = {};
    const responseCancelToken = {};
    const respHeaders = getResponseHeaders(url, responseCancelToken);
    const reqHeaders = getRequestHeaders(url, requestCancelToken);

    const ax =  axios(requestObject).then(async (response)=>{
        return parseResponseObject(requestObject, response);
    }).catch(function (error) {
        if (error.response) {
            return parseResponseObject(requestObject, error.response);
        } else if (error.request) {
            requestCancelToken.cancel();
            responseCancelToken.cancel();
            console.log('network error. just set as unable to connect to server');
            return {err: {code:'ECONNECT', message:'Unable to connect to the host'}};
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
        } else {
            requestCancelToken.cancel();
            responseCancelToken.cancel();
            console.log('Error', error.message);
            return {err: {code:'MALFORMED', message:'Unable to connect to the host'}};
            // Something happened in setting up the request that triggered an Error
        }
    });
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
