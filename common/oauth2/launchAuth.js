var oauthTabs = {};

/**
 * @param url
 * @param redirectUri
 * @param openerTabId - Not supported in edge and firefox for android
 * @returns {Promise<any>}
 */
function startOAuth(url, redirectUri, openerTabId){
    return new Promise((resolve, reject)=>{
        chrome.tabs.create({url, openerTabId}, (tab)=>{
            oauthTabs[tab.id] = { redirectUri, resolve, reject };
        });
    });
}

/**
 * SUPPORTED ON ALL BROWSERS
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved
 */
chrome.tabs.onRemoved.addListener((tabId)=>{
    if(oauthTabs[tabId]){
        if(oauthTabs[tabId].reject){
            oauthTabs[tabId].reject('tab closed before oauth completed');
        }
        oauthTabs[tabId] = undefined;
    }
});

/**
 * SUPPORTED ON ALL BROWSER
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo)=>{
    if(oauthTabs[tabId]) {
        const {redirectUri, resolve, reject} = oauthTabs[tabId];
        console.log("matching", redirectUri, changeInfo.url);
        if (resolve && changeInfo && changeInfo.url) {
            const url = changeInfo.url.replace("http://",'').replace("https://",'');
            const redir = redirectUri.replace("http://",'').replace("https://",'');
            console.log("matching", url, redir);
            if(url.startsWith(redir)) {
                resolve(changeInfo.url);
                console.log('closing tab and resolving with', changeInfo.url);
                oauthTabs[tabId] = undefined;
                chrome.tabs.remove(tabId);
            }
        }
    }
});

module.exports = {
    startOAuth
}
