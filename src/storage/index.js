
function setItem(key, value){
    return new Promise((resolve, reject)=>{
        chrome.storage.local.set({[key]: value}, function() {
            resolve(true);
        });
    });
}

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
