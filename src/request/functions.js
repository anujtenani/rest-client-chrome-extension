const url = require('url');
const formurlencoded = require('form-urlencoded').default;
const {charsetFromType, charsetFromHeaders} = require('./mimefunc');
const {DataUriToBlob, BlobToText, BlobToDataUri} = require('./blobfunc');
const {parseResponseObject} = require('./axiosHelper');
const axios = require('axios');

function buildUrl(uri, qs = {}){
    const parsedUrl = url.parse(uri, true);
    parsedUrl.query = {...parsedUrl.query, ...qs};
    parsedUrl.search = undefined;
    return url.format(parsedUrl);
}


function createFormBody(body){
    const {allIds, byId} = body;
    const map = {};
    allIds.forEach((id)=>{
        const {name, value} = byId[id];
        map[name] = value
    });
    return formurlencoded(map);
}
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

function axiosExecute(url, method='GET', headers = {}, body = {}, qs = {}, auth = undefined){
    console.log(url, method, headers, body, qs, auth);

    const requestObject = {
        url: buildUrl(url, qs),
        method,
        headers,
//        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        withCredentials: "false", // include, *same-origin, omit
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        auth,
        responseType:'blob'
    }

    const {bodyType, text} = body;
    switch (bodyType) {
        case "text":
            requestObject.data = text;
            requestObject.headers['Content-Type'] = 'text/plain';
            break;
        case "json":
            requestObject.data = text;
            requestObject.headers['Content-Type'] = 'application/json';
            break;
        case "binary":
            requestObject.data = DataUriToBlob(text);
            requestObject.headers['Content-Type'] = 'application/*';
            break;
        case "form":
            requestObject.data = createFormBody(body);
            requestObject.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            break;
        case "multipart":
            requestObject.data =  createMultipartBody(body);
    }
    requestObject.headers['Cache-Control'] = 'no-cache';

    return axios(requestObject).then(async (response)=>{
        return parseResponseObject(requestObject, response);
    }).catch(function (error) {
        if (error.response) {
            return parseResponseObject(requestObject, error.response);
        } else if (error.request) {
            console.log('network error. just set as unable to connect to server');
            return error;
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
        } else {
            console.log('Error', error.message);
            return error;
            // Something happened in setting up the request that triggered an Error
        }
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
