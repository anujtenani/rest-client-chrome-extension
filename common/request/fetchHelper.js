const {DataUriToBlob, BlobToText, BlobToDataUri} = require('./blobfunc');
const {charsetFromType, charsetFromHeaders} = require('./mimefunc');
const {createFormBody,createMultipartBody } = require('./formBodyHelper');

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


    const {bodyType, data} = body;
    switch (bodyType) {
        case "xml":
            requestObject.body = data.value;
            requestObject.headers['Content-Type'] = 'application/xml';
            break;
        case "text":
            requestObject.body = data.value;
            requestObject.headers['Content-Type'] = 'text/plain';
            break;
        case "json":
            requestObject.body = JSON.stringify(data.value);
            requestObject.headers['Content-Type'] = 'application/json';
            break;
        case "binary":
            requestObject.body = DataUriToBlob(data.data.uri);
            requestObject.headers['Content-Type'] = requestObject.data.type;
            break;
        case "graphql":
            requestObject.body = JSON.stringify({query:data.value});
            requestObject.headers['Content-Type'] = 'application/json';
            break;
        case "form":
        case "application/x-www-form-urlencoded":
            requestObject.body = createFormBody(getBodyParams(body));
            requestObject.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            break;
        case "multipart":
        case "multipart/form-body":
            requestObject.body =  createMultipartBody(getBodyParams(body.params));
    }

    try {
        const response = await fetch(url, requestObject);
        const {headers, statusCode, statusText, body} = await parseResponseObject(response);
        return {
            headers, statusCode, statusText, body, href:url, method
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
    return {headers:h, statusCode: status, statusText, body};
}

module.exports = executeFetch;
