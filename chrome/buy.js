var target = this;
/**
 * @param {string} q
 * @param {!Array} value
 * @return {undefined}
 */
var g = function(q, value) {
    var attr = q.split(".");
    /** @type {!Window} */
    var win = window || target;
    if (!(attr[0] in win || !win.execScript)) {
        win.execScript("var " + attr[0]);
    }
    var performance;
    for (; attr.length && (performance = attr.shift());) {
        if (attr.length || void 0 === value) {
            win = win[performance] ? win[performance] : win[performance] = {};
        } else {
            /** @type {!Array} */
            win[performance] = value;
        }
    }
};
/**
 * @param {!Object} obj
 * @return {undefined}
 */
var request = function(obj) {
    var port = chrome.runtime.connect("nmmhkkegccagdldgiimedpiccmgmieda", {});
    /** @type {boolean} */
    var type = false;
    port.onMessage.addListener(function(data) {
        /** @type {boolean} */
        type = true;
        if ("response" in data && !("errorType" in data.response)) {
            if (obj.success) {
                obj.success(data);
            }
        } else {
            if (obj.failure) {
                obj.failure(data);
            }
        }
    });
    port.onDisconnect.addListener(function() {
        if (!type && obj.failure) {
            obj.failure({
                request : {},
                response : {
                    errorType : "INTERNAL_SERVER_ERROR"
                }
            });
        }
    });
    port.postMessage(obj);
};
g("google.payments.inapp.buy", function(params) {
    /** @type {string} */
    params.method = "buy";
    request(params);
});
g("google.payments.inapp.consumePurchase", function(requestHeader) {
    /** @type {string} */
    requestHeader.method = "consumePurchase";
    request(requestHeader);
});
g("google.payments.inapp.getPurchases", function(requestHeader) {
    /** @type {string} */
    requestHeader.method = "getPurchases";
    request(requestHeader);
});
g("google.payments.inapp.getSkuDetails", function(requestHeader) {
    /** @type {string} */
    requestHeader.method = "getSkuDetails";
    request(requestHeader);
});
