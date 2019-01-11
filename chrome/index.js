import handleCommand from "../common/handleCommand";
// import './buy';
// const google = require('./buy');
require('./buy');
(function() {

    chrome.identity.getProfileUserInfo((info)=>{
        console.log(info);
    })

    chrome.browserAction.onClicked.addListener((activeTab)=>{
        chrome.tabs.create({url:"http://cbco.in:3000"})
    });

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        console.log("got request", request);
        switch (request.type) {
            case "inapp-sku-details":
                window.google.payments.inapp.getSkuDetails({
                    'parameters': {'env': 'prod'},
                    'success': (details)=>sendResponse(details),
                    'failure': (failed)=>sendResponse(failed)
                });
                return false;
            case "inapp-buy":
                const {sku} = request;
                window.google.payments.inapp.buy({
                    'parameters': {'env': 'prod'},
                    'sku': sku,
                    'success': sendResponse,
                    'failure': sendResponse
                });
                return false;
            case "inapp-get-purchases":
                window.google.payments.inapp.getPurchases({
                    'parameters': {'env': 'prod'},
                    'success': sendResponse,
                    'failure': sendResponse
                });
                return false;
            default:
                //console.log('handling command');
                return handleCommand(request, sender, sendResponse);
        }
    });
}());
