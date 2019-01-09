/**
 * Stores value in chrome localstorage
 * @param key - String
 * @param value - JSON
 * @returns {Promise<any>}
 */
function setItem(key, value){
    return new Promise((resolve, reject)=>{
        chrome.storage.local.set({[key]: value}, function() {
            resolve(true);
        });
    });
}

/**
 * Retrieves value from chrome localstorage
 * @param key - String
 * @returns {Promise<any>}
 */
function getItem(key){
    return new Promise((resolve, reject)=>{
        chrome.storage.local.get([key], function(result) {
            resolve(result.key);
        });
    })
}


module.exports =  {
    setItem, getItem
}
