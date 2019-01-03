const url = require('url');
const formurlencoded = require('form-urlencoded').default;
const {charsetFromType, charsetFromHeaders} = require('./mimefunc');
const {DataUriToBlob, BlobToText, BlobToDataUri} = require('./blobfunc');
const {parseResponseObject} = require('./axiosHelper');
const axios = require('axios');
function buildUrl(uri, qs = {}){
    console.log('building url', uri, qs);
    const parsedUrl = url.parse(uri, true);
    parsedUrl.query = {...parsedUrl.query, ...qs};
    parsedUrl.search = undefined;
    return url.format(parsedUrl);
}


/**
 * Creates form-url-encoded body from body object of the state
 * @param body
 * @returns {*}
 */
function createFormBody(body){
    const {allIds, byId} = body;
    const map = {};
    allIds.forEach((id)=>{
        const {name, value} = byId[id];
        map[name] = value
    });
    return formurlencoded(map);
}

/**
 * Creates multipart body from the body object of the state
 * @param body
 * @returns {FormData}
 */
function createMultipartBody(body){
    const form = new FormData();
    const {allIds, byId} = body;
    allIds.forEach((id)=>{
        const {name, value, inputType, fileName, size, type} = byId[id];
        if(inputType === "file"){
            form.append(name, DataUriToBlob(value), fileName)
        }else{
            form.append(name, value);
        }
    });
    return form;
}

/**
 * Executes the request using axios
 * @param url
 * @param method
 * @param headers
 * @param body
 * @param qs
 * @param auth
 * @returns {Promise<any[] | never>}
 */
function axiosExecute(url, method='GET', headers = {}, body = {}, qs = {}, auth = undefined){
    console.log(url, method, headers, body, qs, auth);

    const requestObject = {
        url: buildUrl(url, qs),
        method,
        headers,
//        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        withCredentials: true, // include, *same-origin, omit
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
            requestObject.data = DataUriToBlob(data);
            requestObject.headers['Content-Type'] = 'application/*';
            break;
        case "graphql":
            requestObject.data = JSON.stringify({query:data});
            requestObject.headers['Content-Type'] = 'application/json';
            break;
        case "form":
            requestObject.data = createFormBody(body);
            requestObject.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            break;
        case "multipart":
            requestObject.data =  createMultipartBody(body);
    }
    requestObject.headers['Cache-Control'] = 'no-cache';
    console.log(requestObject);
    const respHeaders = getResponseHeaders(url);
    const reqHeaders = getRequestHeaders(url);

    const ax =  axios(requestObject).then(async (response)=>{
        console.log(response);
        return parseResponseObject(requestObject, response);
    }).catch(function (error) {
        if (error.response) {
            return parseResponseObject(requestObject, error.response);
        } else if (error.request) {
            console.log('network error. just set as unable to connect to server');
            return {err: {code:'ECONNECT', message:'Unable to connect to the host'}};
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
        } else {
            console.log('Error', error.message);
            return {err: {code:'MALFORMED', message:'Unable to connect to the host'}};
            // Something happened in setting up the request that triggered an Error
        }
    });
    return Promise.all([reqHeaders, respHeaders, ax]).then((data)=>{
        const requestHeaders = data[0];
        const headers = data[1];
        const axiosData = data[2];
        if(headers){
            console.log('got headers', headers);
            return {...axiosData, headers, requestHeaders};
        }else{
            return axiosData
        }
    })
}

/**
 *
 * Since XMLHTTPRequests removes headers like "Set-Cookie" we must get the response headers from chrome webrequest api
 * in order to receive all the headers. This function is only called when a request is being made with axios
 *
 * @requires webRequest permission in the manifest
 * @param url - the url to filter
 * @returns {Promise<any>}
 */
function getResponseHeaders(url){
    return new Promise((resolve, reject)=>{
        const func = (details)=>{
            console.log('got details', details);
            chrome.webRequest.onCompleted.removeListener(func);
            resolve(details.responseHeaders);
        }
        chrome.webRequest.onCompleted.addListener(func, {urls:["<all_urls>"]}, ["responseHeaders"]);
    });

}

function getRequestHeaders(url){
    return new Promise((resolve, reject)=>{
        const func = (details)=>{
            console.log('got details', details);
            chrome.webRequest.onSendHeaders.removeListener(func);
            resolve(details.requestHeaders);
        }
        chrome.webRequest.onSendHeaders.addListener(func, {urls:["<all_urls>"]}, ["requestHeaders"]);
    });
}

/*
function fetchExecute(url, method = 'GET', headers = {}, body = {}, qs = {}){
    const requestObject = {
        method, // *GET, POST, PUT, DELETE, etc.
       // mode: "no-cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "omit", // include, *same-origin, omit
        headers,
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
    }

    const {bodyType, text} = body;
    switch (bodyType) {
        case "text":
            requestObject.body = text;
            headers['Content-Type'] = 'text/plain';
            break;
        case "json":
            requestObject.body = text;
            headers['Content-Type'] = 'application/json';
            break;
        case "binary":
            requestObject.body = DataUriToBlob(text);
            headers['Content-Type'] = 'application/*';
            break;
        case "form":
            requestObject.body = createFormBody(body);
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            break;
        case "multipart":
            requestObject.body =  createMultipartBody(body);
    }


    return fetch(buildUrl(url, qs), requestObject).then(async (response)=>{
        console.log(response);
        const {headers, status, statusText} = response;
        const blob = await response.blob();
        const charset = blob.type ? charsetFromType(blob.type) : charsetFromHeaders(headers);
        const body = charset ? await BlobToText(blob) : await BlobToDataUri(blob);
        console.log('returning');
        const hkeys = headers.keys();

        console.log(headers.get('Content-Length'));
        const hobj = {};
        for(let key of hkeys){
            hobj[key] = headers.get(key);
        }
        return {headers:hobj, status, statusText, body}
    })
}
*/

module.exports = {
    // fetchExecute,
    axiosExecute
}
