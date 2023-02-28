/**
 *  @author :   wushengfei
 *  @date   :   2019/7/17
 *  @description :
 */
define("com/huayun/webgis/layers/support/StyleProperty", [
    "require",
    "exports",
    "./GeometryUtils"
], function (n, p, l) {
    return function () {
        function d(a, c, b) {
            this.isDataDriven = !1;
            switch (c.type) {
                case "number":
                    a = !0;
                    break;
                case "color":
                    a = !0;
                    b = d._parseColor(b);
                    break;
                case "array":
                    a = "number" === c.value;
                    break;
                default:
                    a = !1
            }
            null == b && (b = c.default);
            a && "interval" === b.type && (a = !1);
            var f = b && b.stops && 0 < b.stops.length;
            if (f) for (var e = 0, g = b.stops; e < g.length; e++) {
                var m = g[e];
                m[1] = this._validate(m[1], c)
            }
            if (this.isDataDriven = b ? !!b.property : !1) if (void 0 !== b.default &&
            (b.default = this._validate(b.default, c)), f) switch (b.type) {
                case "identity":
                    this.getValue = this._buildIdentity(b, c);
                    break;
                case "categorical":
                    this.getValue = this._buildCategorical(b, c);
                    break;
                default:
                    this.getValue = a ? this._buildInterpolate(b, c) : this._buildInterval(b, c)
            } else this.getValue = this._buildIdentity(b, c); else f ? this.getValue = a ? this._buildZoomInterpolate(b) : this._buildZoomInterval(b) : (b = this._validate(b, c), this.getValue = this._buildSimple(b))
        }

        d.prototype._validate = function (a, c) {
            if ("number" === c.type) {
                if (a <
                    c.minimum) return c.minimum;
                if (a > c.maximum) return c.maximum
            }
            return a
        };
        d.prototype._buildSimple = function (a) {
            return function () {
                return a
            }
        };
        d.prototype._buildIdentity = function (a, c) {
            var b = this;
            return function (f, e) {
                var g;
                e && (g = e.values[a.property], "color" === c.type && (g = d._parseColor(g)));
                void 0 === g && (g = a.default);
                return void 0 !== g ? b._validate(g, c) : c.default
            }
        };
        d.prototype._buildCategorical = function (a, c) {
            var b = this;
            return function (f, e) {
                var g;
                e && (g = e.values[a.property]);
                g = b._categorical(g, a.stops);
                return void 0 !==
                g ? g : void 0 !== a.default ? a.default : c.default
            }
        };
        d.prototype._buildInterval = function (a, c) {
            var b = this;
            return function (f, e) {
                var g;
                e && (g = e.values[a.property]);
                return "number" === typeof g ? b._interval(g, a.stops) : void 0 !== a.default ? a.default : c.default
            }
        };
        d.prototype._buildInterpolate = function (a, c) {
            var b = this;
            return function (f, e) {
                var g;
                e && (g = e.values[a.property]);
                return "number" === typeof g ? b._interpolate(g, a.stops, a.base || 1) : void 0 !== a.default ? a.default : c.default
            }
        };
        d.prototype._buildZoomInterpolate = function (a) {
            var c =
                this;
            return function (b) {
                return c._interpolate(b, a.stops, a.base || 1)
            }
        };
        d.prototype._buildZoomInterval = function (a) {
            var c = this;
            return function (b) {
                return c._interval(b, a.stops)
            }
        };
        d.prototype._categorical = function (a, c) {
            for (var b = c.length, f = 0; f < b; f++) if (c[f][0] === a) return c[f][1]
        };
        d.prototype._interval = function (a, c) {
            for (var b = c.length, f = 0, e = 0; e < b; e++) if (c[e][0] <= a) f = e; else break;
            return c[f][1]
        };
        d.prototype._interpolate = function (a, c, b) {
            for (var f, e, g = c.length, d = 0; d < g; d++) {
                var h = c[d];
                if (h[0] <= a) f = h; else {
                    e =
                        h;
                    break
                }
            }
            if (f && e) {
                d = e[0] - f[0];
                a -= f[0];
                b = 1 === b ? a / d : (Math.pow(b, a) - 1) / (Math.pow(b, d) - 1);
                if (Array.isArray(f[1])) {
                    f = f[1];
                    e = e[1];
                    a = [];
                    for (d = 0; d < f.length; d++) a.push(l.interpolate(f[d], e[d], b));
                    return a
                }
                return l.interpolate(f[1], e[1], b)
            }
            if (f) return f[1];
            if (e) return e[1]
        };
        d._isEmpty = function (a) {
            for (var c in a) if (a.hasOwnProperty(c)) return !1;
            return !0
        };
        d._parseColor = function (a) {
            /*if (Array.isArray(a)) return a;
            if ("string" === typeof a) {
                if (a = new k(a), !this._isEmpty(a)) return k.toUnitRGBA(a)
            } else return a && a.default &&
            (a.default = d._parseColor(a.default)), a && a.stops && (a.stops = a.stops.map(function (a) {
                return [a[0], d._parseColor(a[1])]
            })), a*/
            return a;
        };
        return d
    }()
});