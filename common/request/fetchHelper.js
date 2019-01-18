const {DataUriToBlob, BlobToText, BlobToDataUri} = require('./blobfunc');
const {charsetFromType, charsetFromHeaders} = require('./mimefunc');
// const {createFormBody,createMultipartBody } = require('./formBodyHelper');

async function executeFetch(url, method="GET", headers, body){
    const requestObject = {
        method, // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers,
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
    }
    console.log("body is", body, typeof body);
    if(typeof body === "object") {
        const {bodyType, data} = body;
        switch (bodyType) {
            case "multipart":
            case "binary":
            case "multipart/form-body":
                requestObject.body = DataUriToBlob(data);
                break;
            default:
                requestObject.body = data;
        }
    }else requestObject.body = body;

    try {
        const startTime = new Date().getTime();
        const response = await fetch(url, requestObject);
        const endTime = new Date().getTime();
        const {headers, statusCode, statusText, body, bodySize} = await parseResponseObject(response);
        return {
            headers, statusCode, statusText, body, href:url, method, bodySize, startTime, endTime
        }
    }catch(e){
        console.log(e);
        return {error: {message: e.toLocaleString() || 'Network error', url, method}}
    }
}


const getBodyParams = (body)=>{
    const {byId, allIds} = body;
    return allIds.map((item)=>{
        const {name, value, inputType, fileName, size, type} = byId[item];
        return {name, value, inputType, fileName, size, type};
    });
}

async function parseResponseObject(response){
    const {headers, status, statusText } = response;
    const h = [];
    for (let pair of headers.entries()) {
        h.push({name:pair[0], value:pair[1]});
    }
    const blob = await response.blob();
    const charset = blob.type ? charsetFromType(blob.type) : charsetFromHeaders(headers);
    const body = charset ? await BlobToText(blob) : await BlobToDataUri(blob);
    return {headers:h, statusCode: status, statusText, body, bodySize: blob.size};
}

module.exports = executeFetch;
