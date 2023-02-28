define("com/huayun/webgis/esriRequest", "require exports ./core/tsSupport/assignHelper dojo/Deferred dojo/has!host-webworker?./core/workers/request dojo/io-query dojo/_base/url dojo/errors/CancelError dojo/request/xhr ./config ./core/deferredUtils ./core/Error ./core/global ./core/has ./core/lang ./core/promiseUtils ./core/urlUtils".split(" "), function (P, ca, v, Q, I, R, J, S, K, T, U, z, V, r, w, p, f) {
    function L(a, c) {
        void 0 === c && (c = !1);
        f.isBlobProtocol(a.url) || f.isDataProtocol(a.url) || !a.content || (a.preventCache && (a.content["request.preventCache"] =
            Date.now()), a.url = f.addQueryParameters(a.url, a.content));
        var b = new Image;
        b.crossOrigin = a.withCredentials ? "use-credentials" : "anonymous";
        var e = !1;
        return p.create(function (d, h) {
            var f = function () {
                b.onload = b.onerror = b.onabort = null;
                c && URL.revokeObjectURL(this.src);
                e || h(Error("Unable to load the resource"))
            };
            b.onload = function () {
                b.onload = b.onerror = b.onabort = null;
                c && URL.revokeObjectURL(this.src);
                e || d(this)
            };
            b.onerror = f;
            b.onabort = f;
            b.alt = "";
            b.src = a.url
        }, function () {
            e = !0;
            b.onload = b.onerror = b.onabort = null;
            b.src =
                ""
        })
    }

    function W(a) {
        a = new J(a);
        return (a.host + (a.port ? ":" + a.port : "")).toLowerCase()
    }

    function X() {
        return E ? E : E = p.create(function (a) {
            P(["./identity/IdentityManager"], a)
        }).then(function (a) {
            l = a
        })
    }

    function Y(a, c) {
        var b = !!a.useProxy, e = a.method || "auto";
        a = v({}, a);
        a.content = a.content || {};
        a._ssl && (a.url = a.url.replace(/^http:/i, "https:"));
        var d = a.url, h = f.isBlobProtocol(d) || f.isDataProtocol(d);
        a._token && (a.content.token = a._token);
        var q = 0, g;
        h || (g = R.objectToQuery(a.content), q = g.length + d.length + 1, r("esri-url-encodes-apostrophe") &&
        (q = g.replace(/'/g, "%27").length + d.length + 1));
        a.timeout = null != a.timeout ? a.timeout : n.timeout;
        a.handleAs = a.handleAs || "json";
        try {
            var t = g = void 0, A = !h && ("post" === e || !!a.body || q > n.maxUrlLength),
                B = !h && (b || !!f.getProxyRule(a.url)), m;
            if (m = !B && "image" === a.handleAs && n.proxyUrl && !h) {
                var y = f.getOrigin(a.url);
                m = !(!y || w.endsWith(y, ".arcgis.com") || f.hasSameOrigin(y, f.appUrl) || -1 !== x._corsServers.indexOf(y) || f.isTrustedServer(y))
            }
            m && (a.handleAs = "blob");
            B && (r("host-browser") || r("host-webworker")) && (g = f.getProxyUrl(d),
                t = g.path, !A && t.length + 1 + q > n.maxUrlLength && (A = !0), g.query && (a.content = v({}, g.query, a.content)), A || (a.preventCache && (a.content["request.preventCache"] = Date.now(), a.preventCache = !1), a.url = f.addQueryParameters(a.url, a.content), a.content = null), a.url = t + "?" + a.url);
            var k = a.headers;
            if (!h) {
                !r("host-browser") && !r("host-webworker") || k && k.hasOwnProperty("X-Requested-With") || (a.headers = k || {}, a.headers["X-Requested-With"] = null);
                if (r("host-browser") && c) {
                    var F = a.content && a.content.token;
                    F && (c.set ? c.set("token", F) :
                        c.append("token", F));
                    a.contentType = !1
                }
                if (!a.hasOwnProperty("withCredentials")) if (b = B ? t : d, f.isTrustedServer(b)) a.withCredentials = !0; else if (l) {
                    var M = l.findServerInfo(b);
                    M && M.webTierAuth && (a.withCredentials = !0)
                }
            }
            if (A) return "image" === a.handleAs && (a.handleAs = "blob"), a.body ? (a.data = c || a.body, a.query = a.content) : a.data = a.content, delete a.body, delete a.content, !B && r("safari") && (a.url += (-1 === a.url.indexOf("?") ? "?" : "\x26") + "_ts\x3d" + Date.now() + Z++), K.post(a.url, a);
            var G;
            if (G = "image" === a.handleAs) {
                var H;
                a:{
                    if (k) for (var u in k) if (k[u]) {
                        H =
                            !0;
                        break a
                    }
                    H = !1
                }
                G = !H
            }
            if (G) return L(a);
            "image" === a.handleAs && (a.handleAs = "blob");
            a.query = a.content;
            delete a.content;
            return K.get(a.url, a)
        } catch (aa) {
            return p.reject(aa)
        }
    }

    function C(a, c, b, e) {
        function d(a) {
            a._pendingDfd = Y(b, t);
            var c = !!a._pendingDfd.response;
            (a._pendingDfd.response || a._pendingDfd).then(function (a) {
                if (!c || !a.data) return a;
                n.proxyUrl && !w.startsWith(a.url, n.proxyUrl) && N(a.url);
                var b = a.getHeader("Content-Type");
                if (b && (b = b.toLowerCase(), -1 === b.indexOf("text/plain") && -1 === b.indexOf("application/json"))) return a;
                b = a.data;
                if (b instanceof ArrayBuffer && 750 >= b.byteLength) b = new Blob([b]); else if (!(b instanceof Blob && 750 >= b.size)) return a;
                var d = new Q, k = new FileReader;
                k.readAsText(b);
                k.onloadend = function () {
                    if (!k.error) try {
                        var b = JSON.parse(k.result);
                        b.error && (Object.isExtensible(a) || (a = v({}, a)), a._jsonData = b)
                    } catch (da) {
                    }
                    d.resolve(a)
                };
                return d.promise
            }).then(function (a) {
                return c && !a._jsonData && "image" === e.requestOptions.responseType && a.data instanceof Blob ? (c = !1, b.url = URL.createObjectURL(a.data), L(b, !0)) : a
            }).then(function (b) {
                var d =
                    c ? b.data : b, k = c ? b.getHeader.bind(b) : D;
                if (d && (b = c && b._jsonData || d, b.error || "error" === b.status)) throw d = w.mixin(Error(), b.error || b), d.getHeader = k, d;
                a.resolve({data: d, url: e.url, requestOptions: e.requestOptions, getHeader: k});
                a._pendingDfd = null
            }).catch(function (c) {
                var d, k, g, m;
                c && (d = Number(c.code), k = c.hasOwnProperty("subcode") ? Number(c.subcode) : null, g = (g = c.messageCode) && g.toUpperCase(), m = c.response);
                if (m && 0 === m.status && n.proxyUrl && !h && "post" !== b.method && m.url && !w.startsWith(m.url, n.proxyUrl)) f.addProxyRule({
                    proxyUrl: n.proxyUrl,
                    urlPrefix: f.removeFile(f.urlToObject(b.url).path)
                }), C(a, !0, b, e); else {
                    if (403 === d && (4 === k || c.message && -1 < c.message.toLowerCase().indexOf("ssl") && -1 === c.message.toLowerCase().indexOf("permission"))) {
                        if (!b._ssl) {
                            b._ssl = b._sslFromServer = !0;
                            C(a, !0, b, e);
                            return
                        }
                    } else if (q && "no-prompt" !== b.authMode && l._errorCodes && -1 !== l._errorCodes.indexOf(d) && !l._isPublic(b.url) && (403 !== d || O && -1 === O.indexOf(g) && (null == k || 2 === k && b._token))) {
                        ba(a, b, e, u("request:server", c, e));
                        return
                    }
                    m && 0 < m.status && m.url && n.proxyUrl && !w.startsWith(m.url,
                        n.proxyUrl) && N(m.url);
                    a.reject(u("request:server", c, e));
                    a._pendingDfd = null
                }
            })
        }

        var h = b.body, q = b.useIdentity, g, t = null, p = h instanceof FormData;
        if (p || h && h.elements) t = p ? h : new FormData(h);
        var r = !!(-1 !== b.url.toLowerCase().indexOf("token\x3d") || b.content && b.content.token || t && t.get && t.get("token") || h && h.elements && h.elements.token);
        c || (!q || r || b._token || l._isPublic(b.url) || (c = function (a) {
            a && (b._token = a.token, b._ssl = a.ssl)
        }, "immediate" === b.authMode ? g = l.getCredential(b.url).then(c) : "no-prompt" === b.authMode ? g =
            l.checkSignInStatus(b.url).then(c).catch(function () {
            }) : c(l.findCredential(b.url))), c = function (a) {
            delete b._credential;
            if (a) {
                var c = !!b._ssl;
                a instanceof z ? a.details.ssl = c : a.ssl = c
            }
        }, a.then(function (a) {
            (/\/sharing\/rest\/accounts\/self/i.test(b.url) || /\/sharing\/rest\/portals\/self/i.test(b.url)) && !r && !b._token && a.data && a.data.user && a.data.user.username && (f.isTrustedServer(b.url) || n.trustedServers.push(W(b.url)));
            var c = b._credential;
            if (c) {
                var d = l.findServerInfo(c.server), d = d && d.owningSystemUrl, e = void 0;
                d && (d = d.replace(/\/?$/, "/sharing"), (e = l.findCredential(d, c.userId)) && -1 === l._getIdenticalSvcIdx(d, e) && e.resources.splice(0, 0, d))
            }
            return a
        }).then(c, c));
        g ? g.then(function () {
            a.isCanceled() || d(a)
        }).catch(function (b) {
            a.reject(b)
        }) : d(a);
        return a.promise
    }

    function ba(a, c, b, e) {
        a._pendingDfd = l.getCredential(c.url, {error: e, token: c._token});
        a._pendingDfd.then(function (d) {
            c._token = d.token;
            c._credential = d;
            c._ssl = c._sslFromServer || d.ssl;
            C(a, !0, c, b)
        }).catch(function (b) {
            a.reject(b);
            a._pendingDfd = null
        })
    }

    function u(a,
               c, b) {
        var e = "Error", d = {url: b.url, requestOptions: b.requestOptions, getHeader: D};
        if (c instanceof z) return c.details ? (c.details = w.clone(c.details), c.details.url = b.url, c.details.requestOptions = b.requestOptions) : c.details = d, c;
        if (c) {
            var f = c.response;
            b = f && f.getHeader;
            var f = f && f.status, l = c.message;
            b = c.getHeader || b;
            l && (e = l);
            b && (d.getHeader = b);
            d.httpStatus = (null != c.httpCode ? c.httpCode : c.code) || f;
            d.subCode = c.subcode;
            d.messageCode = c.messageCode;
            d.messages = "string" === typeof c.details ? [c.details] : c.details
        }
        a = new z(a,
            e, d);
        c && "cancel" === c.dojoType && (a.name = "AbortError", a.dojoType = "cancel");
        return a
    }

    function N(a) {
        f.isBlobProtocol(a) || f.isDataProtocol(a) || (a = f.getOrigin(a)) && -1 === x._corsServers.indexOf(a) && x._corsServers.push(a)
    }

    function x(a, c) {
        if (I && V.invokeStaticMessage) return I.execute(a, c);
        f.isBlobProtocol(a) || f.isDataProtocol(a) || (a = f.normalize(a));
        var b = {url: a, requestOptions: v({}, c)}, e = f.getInterceptor(a);
        if (e) {
            if (null != e.responseData) return p.resolve({
                data: e.responseData, requestOptions: b.requestOptions, getHeader: D,
                url: a
            });
            e.headers && (b.requestOptions.headers = v({}, b.requestOptions.headers, e.headers));
            e.query && (b.requestOptions.query = v({}, b.requestOptions.query, e.query));
            if (e.before && (c = e.before(b), null != c)) return c instanceof Error || c instanceof z ? p.reject(u("request:interceptor", c, b)) : p.resolve({
                data: c,
                requestOptions: b.requestOptions,
                getHeader: D,
                url: b.url
            })
        }
        var d = v({url: b.url}, b.requestOptions);
        d.content = d.query;
        delete d.query;
        d.preventCache = !!d.cacheBust;
        delete d.cacheBust;
        d.handleAs = d.responseType;
        delete d.responseType;
        "array-buffer" === d.handleAs && (d.handleAs = "arraybuffer");
        if ("image" === d.handleAs) {
            if (r("host-webworker")) return p.reject(u("request:invalid-parameters", Error("responseType 'image' is not supported in Web Workers or Node environment"), b))
        } else if (f.isDataProtocol(a)) return p.reject(u("request:invalid-parameters", Error("Data URLs are not supported for responseType \x3d " + d.handleAs), b));
        var h = n.useIdentity;
        "anonymous" === d.authMode && (h = !1);
        d.useIdentity = h;
        d.urlObj = new J(d.url);
        var q = U.makeDeferredCancellingPending(),
            g;
        b.requestOptions.signal && (a = b.requestOptions.signal, g = function () {
            q.cancel(u("AbortError", new S("Request canceled"), b))
        }, a.aborted ? g() : a.addEventListener("abort", g));
        p.resolve().then(function () {
            if (h && !l) return X()
        }).catch(function () {
        }).then(function () {
            q.isCanceled() || C(q, !1, d, b)
        });
        return q.then(function (a) {
            b.requestOptions.signal && b.requestOptions.signal.removeEventListener("abort", g);
            e && e.after && e.after(a);
            return a
        }).catch(function (a) {
            b.requestOptions.signal && b.requestOptions.signal.removeEventListener("abort",
                g);
            throw a;
        })
    }

    var n = T.request, O = ["COM_0056", "COM_0057"], Z = 0, D = function () {
        return null
    }, l, E;
    (x || (x = {}))._corsServers = ["https://server.arcgisonline.com", "https://services.arcgisonline.com"];
    return x
});
