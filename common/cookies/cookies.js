function setCookie(url, {name, value, domain, path, secure, httpOnly, expirationDate}){
    return new Promise((resolve, reject)=>{
        chrome.cookies.set({url, name, value, domain, path, secure, httpOnly, expirationDate}, (cookie)=>{
            resolve(cookie);
        })
    })
}

function getAllCookies(url){
    return new Promise((resolve, reject)=>{
        chrome.cookies.getAll({url},(cookies)=>{
            resolve(cookies)
        })
    })
}

function deleteCookie(name){
    return new Promise((resolve, reject)=>{
        chrome.cookies.delete({name}, (result)=>{
            resolve(result);
        })
    })
}

module.exports = {
    getAllCookies, setCookie, deleteCookie
}
