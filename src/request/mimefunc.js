const mime = require('mime-types');
function getHeader(key, headersObject){
    const headerKey = Object.keys(headersObject).find((headerKey)=> headerKey.toLowerCase() === key.toLowerCase());
    return  headerKey ? headersObject[headerKey] : undefined;
}

function charsetFromHeaders(headers){
    const contentType = getHeader('content-type');
    return mime.charset(contentType);
}

function charsetFromType(mimetype){
    return mime.charset(mimetype)
}

module.exports = {
    charsetFromHeaders, charsetFromType
}
