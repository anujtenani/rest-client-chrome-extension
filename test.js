fetch("https://hideitpro.com").then((e)=>e.text())
    .then((e)=>{
        console.log(e)
    }).catch((e)=>{
    console.log('error',e);
})

const url = "https://hideitpro.com";

chrome.cookies.getAll({url},(cookies)=>{
    console.log(cookies)
})

chrome.tabs.create({url:'https://hideitpro.com'}, (re)=>{
    console.log(re);
})

chrome.webRequest.onCompleted.addListener((details)=>{
    console.log(details);
}, {urls:["<all_urls>"]}, ["responseHeaders"]);//console.log(document);
//alert('extns');
