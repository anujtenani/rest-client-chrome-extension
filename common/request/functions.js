const executeFetch = require('./fetchHelper');
const url = require('url');
const {charsetFromType, charsetFromHeaders} = require('./mimefunc');
const {DataUriToBlob, BlobToText, BlobToDataUri} = require('./blobfunc');
const {parseResponseObject} = require('./axiosHelper');

/**
 * Executes the request using axios
 * @param url
 * @param method
 * @param headers
 * @param body
 * @returns {Promise<any[] | never>}
 */
async function sendRequest(url, method='GET', headers = {}, body = {}){

    const requestCancelToken = {};
    const responseCancelToken = {};
    const respHeaders = getResponseHeaders(url, responseCancelToken);
    const reqHeaders = getRequestHeaders(url, requestCancelToken);

    const f = await executeFetch(url, method, headers, body);
    if(f.error){
        responseCancelToken.cancel();
        requestCancelToken.cancel();
    }
    console.log('fetch finished executing', f);


    return Promise.all([ f, reqHeaders, respHeaders]).then((data)=>{
        console.log('all promises have resolved', data);
        const requestHeaders = data[1];
        const {ip, responseHeaders} = data[2];
        const axiosData = data[0];
        if(responseHeaders){
            return {...axiosData, headers:responseHeaders, serverIpAddress: ip, requestHeaders};
        }else{
            return axiosData
        }
    }).catch((e)=>{
        responseCancelToken.cancel();
        requestCancelToken.cancel();
        console.log('got error in promise.all');
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
            console.log("response", details);
            const {ip, responseHeaders} = details;
            resolve({ip, responseHeaders});
        }
        cancelToken.cancel = ()=>{
            chrome.webRequest.onCompleted.removeListener(func);
            resolve({});
        }
        chrome.webRequest.onCompleted.addListener(func, {urls:["<all_urls>"], tabId:-1, types:["xmlhttprequest"]}, ["responseHeaders"]);
    });
}

function getRequestHeaders(url, cancelToken){
    return new Promise((resolve, reject)=>{
        const func = (details)=>{
            chrome.webRequest.onSendHeaders.removeListener(func);
            console.log('request', details);
            resolve(details.requestHeaders);
        }
        cancelToken.cancel = ()=>{
            chrome.webRequest.onSendHeaders.removeListener(func);
            resolve({});
        }
        chrome.webRequest.onSendHeaders.addListener(func, {urls:["<all_urls>"],tabId:-1, types:["xmlhttprequest"]}, ["requestHeaders"]);
        //tabId is -1 to limit requests originating from this extension only
    });
}

module.exports = {
    sendRequest
}
