define(
    "com/huayun/webgis/facade/PowerFacade", [
        "dojo/_base/declare",
        "dojo/request"
    ], function (declare, request) {

        return declare("com.huayun.webgis.facade.PowerFacade", null, {
            url: "",

            constructor: function (params) {
                declare.safeMixin(this, params);
                // this._url = params.url;
            },

            getMapInfoData: function (result, fault) {
                var infoUrl = this.url.substring(0, this.url.indexOf("MapServer") + 9);
                var index = this.url.indexOf("access");
                if (index > -1) { // ��token
                    var tokenIndex = this.url.indexOf("&", index);
                    var tokenInfo;
                    if (tokenIndex > -1) {
                        tokenInfo = this.url.substring(index, tokenIndex);
                        infoUrl += "?f=json&" + tokenInfo;
                    } else {
                        tokenInfo = this.url.substring(index);
                        infoUrl += "?f=json&" + tokenInfo;
                    }
                } else { // ��token
                    infoUrl += "?f=json";
                }



                /*var reg = /\/\w+\?.+/;
                var tokenReg = /access_token=([\d+|\w+]-?)+/;
                var requestUrl = this.url.replace(reg, "");
                var tokenValue = this.url.match(tokenReg) !== null ? this.url.match(tokenReg)[0] : null;
                requestUrl = tokenValue === null ? requestUrl + "?f=json" : requestUrl + "?f=json&" + tokenValue;*/

                var token = dojoConfig.token;
                var headers = token?{
                    "access-key": token
                    }: {};
                request.get(infoUrl, {handleAs: "json", headers: headers}).then(function (data) {
                    result(data);
                }, function (err) {
                    fault(err);
                });
            }
        });
    });