define("com/huayun/webgis/core/base", [
    "custom/crypto-js.min"
], function (CryptoJS) {
    if (!dojoConfig) return;
    var app = dojoConfig.app;
    if (!app) return;
    var accessKey = dojoConfig.app.accessKey,
        secretKey = dojoConfig.app.secretKey;
    if (!accessKey || !secretKey) return;

    const key = CryptoJS.enc.Utf8.parse("123456yrxo@kc6x3");
    function addZero(num) {
        return num < 10 ? "0" + num : num;
    }
    const date = new Date();
    const timeStamp = date.getFullYear() + addZero(date.getMonth() + 1) + addZero(date.getDate());
    function checkAccessKey(accessKey, secretKey) {
        let strs = CryptoJS.enc.Utf8.parse(`${accessKey}+${secretKey}+${timeStamp}`);
        let accessKeyStr = CryptoJS.AES.encrypt(strs, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return accessKeyStr.toString();
    }
    dojoConfig.token = checkAccessKey(accessKey, secretKey);
});