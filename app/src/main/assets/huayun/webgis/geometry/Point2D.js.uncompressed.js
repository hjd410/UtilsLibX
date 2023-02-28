define("com/huayun/webgis/geometry/Point2D", [], function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.type = "point";
    }

    Point.prototype = {
        clone: function () {
            return new Point(this.x, this.y);
        },
        add: function (p) {
            return this.clone()._add(p);
        },

        sub: function (p) {
            return this.clone()._sub(p);
        },

        multByPoint: function (p) {
            return this.clone()._multByPoint(p);
        },
        /**
         * 点的相除
         * @param {Point} p  - 要相除的点
         * @returns {Point}  - 相除后的新点
         */
        divByPoint: function (p) {
            return this.clone()._divByPoint(p);
        },

        mult: function (k) {
            return this.clone()._mult(k);
        },

        div: function (k) {
            return this.clone()._div(k);
        },

        rotate: function (a) {
            return this.clone()._rotate(a);
        },

        rotateAround: function (a, p) {
            return this.clone()._rotateAround(a, p);
        },
        
        matMult: function (m) {
            return this.clone()._matMult(m);
        },

        unit: function () {
            return this.clone()._unit();
        },

        perp: function () {
            return this.clone()._perp();
        },

        round: function () {
            return this.clone()._round();
        },

        mag: function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },

        equals: function (other) {
            return this.x === other.x &&
                this.y === other.y;
        },

        dist: function (p) {
            return Math.sqrt(this.distSqr(p));
        },

        distSqr: function (p) {
            var dx = p.x - this.x,
                dy = p.y - this.y;
            return dx * dx + dy * dy;
        },

        angle: function () {
            return Math.atan2(this.y, this.x);
        },

        angleTo: function (b) {
            return Math.atan2(this.y - b.y, this.x - b.x);
        },

        angleWith: function (b) {
            return this.angleWithSep(b.x, b.y);
        },

        angleWithSep: function (x, y) {
            return Math.atan2(
                this.x * y - this.y * x,
                this.x * x + this.y * y);
        },
        
        _matMult: function (m) {
            var x = m[0] * this.x + m[1] * this.y,
                y = m[2] * this.x + m[3] * this.y;
            this.x = x;
            this.y = y;
            return this;
        },
        _add: function (p) {
            this.x += p.x;
            this.y += p.y;
            return this;
        },
        _sub: function (p) {
            this.x -= p.x;
            this.y -= p.y;
            return this;
        },

        _mult: function (k) {
            this.x *= k;
            this.y *= k;
            return this;
        },
        _div: function (k) {
            this.x /= k;
            this.y /= k;
            return this;
        },

        _multByPoint: function (p) {
            this.x *= p.x;
            this.y *= p.y;
            return this;
        },

        _divByPoint: function (p) {
            this.x /= p.x;
            this.y /= p.y;
            return this;
        },
        _unit: function () {
            this._div(this.mag());
            return this;
        },

        _perp: function () {
            var y = this.y;
            this.y = this.x;
            this.x = -y;
            return this;
        },

        _rotate: function (angle) {
            var cos = Math.cos(angle),
                sin = Math.sin(angle),
                x = cos * this.x - sin * this.y,
                y = sin * this.x + cos * this.y;
            this.x = x;
            this.y = y;
            return this;
        },

        _rotateAround: function (angle, p) {
            var cos = Math.cos(angle),
                sin = Math.sin(angle),
                x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
                y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
            this.x = x;
            this.y = y;
            return this;
        },

        _round: function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        }
    };

    Point.convert = function (a) {
        if (a instanceof Point) {
            return a;
        }
        if (Array.isArray(a)) {
            return new Point(a[0], a[1]);
        }
        return a;
    };

    return Point;
});