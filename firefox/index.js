import {handleCommand} from "../common/handleCommand";

(function() {

    browser.browserAction.onClicked.addListener((activeTab)=>{

    })

    browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
       // console.log("got background request", request);
        return handleCommand(request, sender, sendResponse)
    });
}());
