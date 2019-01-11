const formurlencoded = require('form-urlencoded').default;
const {DataUriToBlob, BlobToText, BlobToDataUri} = require('./blobfunc');

/**
 * Creates multipart body from the body object of the state
 * @returns {FormData}
 * @param params
 */
function createMultipartBody(params){
    const form = new FormData();
    params.forEach((item)=>{
        const {name, value, inputType, fileName, size, type} = item;
        if(inputType === "file"){
            form.append(name, DataUriToBlob(value), fileName)
        }else{
            form.append(name, value);
        }
    });
    return form;
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
