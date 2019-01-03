const {axiosExecute} = require('./request/functions');
const {getLastRequestTiming}  = require('./request/timer');
const {getItem, setItem} =  require('./storage/index');
(function() {



    chrome.webRequest.onCompleted.addListener((details)=>{
        console.log(details);
    }, {urls:["<all_urls>"]}, ["responseHeaders"]);

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        console.log(sender, request);
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
                const {url, headers, body, qs, method, auth, cancelKey} = request.payload;
                axiosExecute(url, method, headers, body, qs, auth)
                    .then((result) => {
                        result.timings = getLastRequestTiming();
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
            default:
                sendResponse('no method found');
                return false; //since the response is sent sync
        }
        return true; //since the response is send async
    });
}());
