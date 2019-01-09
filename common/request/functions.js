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
 * @returns {*}
 * @param params
 */
function createFormBody(params){
    const map = {};
    params.forEach((item)=>{
        const {name, value} = item;
        map[name] = value
    });
    return formurlencoded(map);
}

/**
 * Creates multipart body from the body object of the state
 * @returns {FormData}
 * @param params
 */
function createMultipartBody(params){
    const form = new FormData();
    params.forEach((item)=>{
        const {name, value, inputType, fileName, size, type} = item
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
 * @param auth
 * @returns {Promise<any[] | never>}
 */
function axiosExecute(url, method='GET', headers = {}, body = {}, auth = undefined){
    console.log(url, method, headers, body, auth);

    const requestObject = {
        url,
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
    return Promise.all([ ax, reqHeaders, respHeaders]).then((data)=>{
        console.log('all promises have resolved', data);
        const requestHeaders = data[1];
        const headers = data[2];
        const axiosData = data[0];
        if(headers){
            console.log('got headers', headers);
            return {...axiosData, headers, requestHeaders};
        }else{
            return axiosData
        }
    }).catch((e)=>{

        console.log('got error in promise.all')
        return {};
    })
}

/**
 *
 * Since XMLHTTPRequests removes headers like "Set-Cookie" we must get the response headers from chrome webrequest api
 * in order to receive all the headers. This function is only called when a request is being made with axios
 *
 * @requires webRequest permission in the manifest
 * @param url - the url to filter
 * @param cancelToken
 * @returns {Promise<any>}
 */
function getResponseHeaders(url, cancelToken){
    return new Promise((resolve, reject)=>{
        const func = (details)=>{
            chrome.webRequest.onCompleted.removeListener(func);
            resolve(details.responseHeaders);
        }
        cancelToken.cancel = ()=>{
            resolve({});
        }
        chrome.webRequest.onCompleted.addListener(func, {urls:["<all_urls>"], tabId:-1}, ["responseHeaders"]);
    });
}

function getRequestHeaders(url, cancelToken){
    return new Promise((resolve, reject)=>{
        const func = (details)=>{
            chrome.webRequest.onSendHeaders.removeListener(func);
            resolve(details.requestHeaders);
        }
        cancelToken.cancel = ()=>{
            resolve({});
        }
        chrome.webRequest.onSendHeaders.addListener(func, {urls:["<all_urls>"], tabId:-1}, ["requestHeaders"]);
        //tabId is -1 to limit requests originating from this extension only
    });
}
module.exports = {
    // fetchExecute,
    axiosExecute
}
