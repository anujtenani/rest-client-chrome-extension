
var oauthTabs = {};

function startOAuth(url, redirectUri, openerTabId){
    return new Promise((resolve, reject)=>{
        chrome.tabs.create({url, openerTabId}, (tab)=>{
            oauthTabs[tab.id] = { redirectUri, resolve, reject };
        });
    });
}

chrome.tabs.onRemoved.addListener((tabId)=>{
    if(oauthTabs[tabId]){
        if(oauthTabs[tabId].reject){
            oauthTabs[tabId].reject('tab closed before oauth completed');
        }
        oauthTabs[tabId] = undefined;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo)=>{
    if(oauthTabs[tabId]) {
        const {redirectUri, resolve, reject} = oauthTabs[tabId];
        if (resolve && changeInfo && changeInfo.url && changeInfo.url.startsWith(redirectUri)) {
            resolve(changeInfo.url);
            console.log('closing tab and resolving with', changeInfo.url);
            oauthTabs[tabId] = undefined;
            chrome.tabs.remove(tabId);
        }
    }
});

module.exports = {
    startOAuth
}
