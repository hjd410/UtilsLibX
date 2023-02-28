define("com/huayun/webgis/utils/Resource", ["exports", "dojo/Deferred"], function (exports, Deferred) {
    var fetch = self ? self.fetch : window.fetch;
    var Request = self ? self.Request : window.Request;
    var AbortController = self ? self.AbortController : window.AbortController;

    function loadImg(url, callback) {
        var img = new Image();
        img.setAttribute("crossorigin", 'anonymous');
        img.onload = function () {
            callback(null, img);
        };
        img.onerror = function () {
            return callback(new Error("加载图片失败, 图片地址是: " + url));
        };
        img.src = url;
    }

    function getBlob(requestParameters, callback) {
        requestParameters.type = "blob";
        return makeRequest(requestParameters, callback);
    }

    function makeRequest(requestParameters, callback) {
        if (!/^file:/.test(requestParameters.url)) {
            if (fetch && Request && AbortController && Request.prototype.hasOwnProperty('signal')) {
                return makeFetchRequest(requestParameters, callback);
            }
        }
        return makeXMLHttpRequest(requestParameters, callback);
    }

    function makeFetchRequest(requestParameters, callback) {
        var controller = new AbortController();
        var request = new Request(requestParameters.url, {
            method: requestParameters.method || 'GET',
            body: requestParameters.body,
            credentials: requestParameters.credentials,
            headers: requestParameters.headers,
            signal: controller.signal
        });
        var complete = false;
        if (requestParameters.type === 'json') {
            request.headers.set('Accept', 'application/json');
        }

        fetch(request).then(function (response) {
            if (response.ok) {
                return (requestParameters.type === 'blob' ? response.blob() :
                        requestParameters.type === 'arrayBuffer' ? response.arrayBuffer() :
                            requestParameters.type === 'json' ? response.json() : response.text()
                ).then(function (result) {
                    complete = true;
                    callback(null, result);
                }).catch(function (err) {
                    return callback(new Error(err.message));
                })
            } else {
                return callback(new Error(response.statusText + response.status + requestParameters.url));
            }
        }).catch(function (error) {
            callback(new Error(error.message));
        });
        return {
            cancel: function () {
                if (!complete) {
                    controller.abort();
                }
            }
        };
    }

    function makeXMLHttpRequest(requestParameters, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(requestParameters.method || 'GET', requestParameters.url, true);
        if (requestParameters.type === 'arrayBuffer') {
            xhr.responseType = 'arraybuffer';
        }
        if (requestParameters.type === 'blob') {
            xhr.responseType = 'blob';
        }

        for (var k in requestParameters.headers) {
            xhr.setRequestHeader(k, requestParameters.headers[k]);
        }
        if (requestParameters.type === 'json') {
            xhr.setRequestHeader('Accept', 'application/json');
        }
        xhr.withCredentials = requestParameters.credentials === 'include';
        xhr.onerror = function () {
            callback(new Error(xhr.statusText));
        };
        xhr.onload = function () {
            if (((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) && xhr.response !== null) {
                var data = xhr.response;
                if (requestParameters.type === 'json') {
                    try {
                        data = JSON.parse(xhr.response);
                    } catch (err) {
                        return callback(err);
                    }
                }
                callback(null, data);
            } else {
                callback(new Error(xhr.statusText + xhr.status + requestParameters.url));
            }
        };
        xhr.send(requestParameters.body);
        return {
            cancel: function () {
                return xhr.abort();
            }
        };
    }

    exports.loadImage = function (url, options, callback) {
        if (typeof options === "function") {
            return loadImg(url, options);
        }
        if (options && (options.headers || options.method === "POST")) {
            options.url = url;
            return getBlob(options, function (err, data) {
                if (err) {
                    callback(err);
                } else if (data) {
                    var img = new Image();
                    var URL = URL || webkitURL;
                    img.onload = function () {
                        callback(null, img);
                        URL.revokeObjectURL(img.src);
                    };
                    img.onerror = function () {
                        return callback(new Error("加载图片失败, 图片地址是: " + url));
                    };
                    img.src = URL.createObjectURL(data);
                }
            })
        }
        return loadImg(url, callback);
    }

    exports.loadImagePromise = function (url, options) {
        var deferred = new Deferred();
        if (options && (options.headers || options.method === "POST")) {
            options.url = url;
            getBlob(options, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else if (data) {
                    var img = new Image();
                    var URL = URL || webkitURL;
                    img.onload = function () {
                        deferred.resolve(img);
                        URL.revokeObjectURL(img.src);
                    };
                    img.onerror = function () {
                        return deferred.reject(new Error("加载图片失败, 图片地址是: " + url));
                    };
                    img.src = URL.createObjectURL(data);
                }
            });
            return deferred;
        }
        loadImg(url, function (err, data) {
            if (err) {
                deferred.reject(err);
            } else if (data) {
                deferred.resolve(data);
            }
        });
        return deferred;
    }

    exports.loadJson = function (url, options, callback) {
        if (typeof options === "function") {
            return makeRequest({
                url: url,
                type: 'json'
            }, options);
        }
        if (!options) {
            options = {};
        }
        options.url = url;
        options.type = 'json';
        return makeRequest(options, callback);
    }

    exports.loadArrayBuffer = function (url, options, callback) {
        if (typeof options === "function") {
            return makeRequest({
                url: url,
                type: 'arrayBuffer'
            }, options);
        }
        if (!options) {
            options = {};
        }
        options.url = url;
        options.type = 'arrayBuffer';
        return makeRequest(options, callback);
    }
});