window.addEventListener("message", function(event) {
    if (event.source === window && event.data.origin === "page") {
//       alert("Content script received message: \"" + event.data.message + "\"");
        //console.log('got data', event.data);
        browser.runtime.sendMessage("bc9bcdc05ecc9e32613d7a92c4de52c6252299fd@temporary-addon", event.data).then((e)=>{
           // console.log("returned value", e);
            window.postMessage({result:e, key: event.data.key, origin:"extension"}, "*");
        });
    }
});
