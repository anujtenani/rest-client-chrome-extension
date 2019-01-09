import {handleCommand} from "../common/handleCommand";

(function() {
    browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log("got background request", request);
        return handleCommand(request, sender, sendResponse)
    });
}());
