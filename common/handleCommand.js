const {sendRequest} = require('../common/request/functions');
const {getLastRequestTiming}  = require('../common/request/timer');
const {getItem, setItem, removeItem} =  require('../common/storage/index');
const {getAllCookies, setCookie, deleteCookie}  = require('../common/cookies/cookies');

const launchAuth = require('../common/oauth2/launchAuth');

function handleCommand(request, sender, sendResponse){
    //console.log('got command', request, sender);
    switch (request.type) {
        case "ping": //to check if the extension is responding
            return sendResponse("pong");
        case "storage.get": {
            const {key} = request.payload;
            getItem(key).then((value) => sendResponse(value));
            break;
        }
        case "storage.set": {
            const {key, value} = request.payload;
            setItem(key, value).then((key) => sendResponse(key));
            break;
        }
        case "storage.remove":{
            const {key} = request.payload;
            removeItem(key).then((key)=>sendResponse(key));
            break;
        }
        case "request.send": {
            const {url, headers, body, method, cancelKey} = request.payload;
            console.log('executing', url, headers, body,method);
            sendRequest(url, method, headers, body)
                .then((result) => {
                    if(!result.err){
                        result.timings = getLastRequestTiming();
                    }
                    console.log('sending', result);
                    sendResponse(result)
                });
            break;
        }
        case "request.cancel":{
            const {cancelKey} = request.payload; //TODO implement this
            break;
        }
        case "cookies.set":{
            const {url, name, value, domain, path, secure, expirationDate, httpOnly} = request.payload;
            setCookie(url, {name, value, domain,secure, path, expirationDate, httpOnly});
            break;
        }
        case "cookies.delete":{
            const {name} = request.payload;
            deleteCookie(name).then(sendResponse);
            break;
        }
        case "cookies.getAll":{
            const {url} = request.payload;
            getAllCookies(url).then(sendResponse);
            break;
        }
        case "open.oauth.tab":{
            const {url, redirectUri} = request.payload;
            launchAuth.startOAuth(url, redirectUri, sender.tab.id).then((url)=>{
                sendResponse(url);
            }).catch((e)=>{
                sendResponse({error:e})
            })
            break;
        }
        default:
            sendResponse('no method found');
            return false; //since the response is sent sync
    }
    return true; //since the response is send async
}

module.exports = handleCommand;
