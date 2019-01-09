const {axiosExecute} = require('../common/request/functions');
const {getLastRequestTiming}  = require('../common/request/timer');
const {getItem, setItem} =  require('../common/storage/index');
const launchAuth = require('../common/oauth2/launchAuth');

function handleCommand(request, sender, sendResponse){
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
            setItem(key, value).then((value) => sendResponse(value));
            break;
        }
        case "request.send": {
            const {url, headers, body, method, auth, cancelKey} = request.payload;
            axiosExecute(url, method, headers, body, auth)
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

            break;
        }
        case "cookies.delete":{
            break;
        }
        case "cookies.get":{
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

module.exports = {
    handleCommand
}
