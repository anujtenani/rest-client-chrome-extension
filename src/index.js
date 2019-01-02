const {axiosExecute} = require('./request/functions');
const {getLastRequestTiming}  = require('./request/timer');
const {getItem, setItem} =  require('./storage/index');
(function() {
    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        console.log(sender, request);
        switch (request.type) {
            case "ping": //to check if the extension is responding
                return sendResponse("pong");
            case "storage.get": {
                const {key} = request.payload;
                getItem(request.key).then((value) => sendResponse(value));
                break;
            }
            case "storage.set": {
                const {key, value} = request.payload
                setItem(request.key).then((value) => sendResponse(value));
                break;
            }
            case "request.send": {
                const {url, headers, body, qs, method, auth, cancelKey} = request.payload;
                axiosExecute(url, method, headers, body, qs, auth)
                    .then((result) => {
                        result.timings = getLastRequestTiming();
                        sendResponse(result)
                    });
                break;
            }
            case "request.cancel":{
                const {cancelKey} = request.payload; //TODO implement this
                break;
            }
            default:
                sendResponse('no method found');
                return false; //since the response is sent sync
        }
        return true; //since the response is send async
    });
}());
