import handleCommand from "../common/handleCommand";

(function() {

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
            return handleCommand(request, sender, sendResponse);
    });
}());
