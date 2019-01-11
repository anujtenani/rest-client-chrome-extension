/**
 * Stores value in chrome localstorage
 * @param key - String
 * @param value - JSON
 * @returns {Promise<any>}
 */
function setItem(key, value){
    return new Promise((resolve, reject)=>{
        chrome.storage.local.set({[key]: value}, function() {
            resolve(key);
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
            console.log(key, result[key]);
            if(typeof result[key] === "object"){
                resolve(JSON.stringify(result[key]));
            }else{
                resolve(result[key]);
            }
        });
    })
}

function removeItem(key){
    return new Promise((resolve, reject)=>{
        chrome.storage.local.remove(key, ()=>{
            resolve(key)
        })
    })
}


module.exports =  {
    setItem, getItem, removeItem
}
