define("com/huayun/webgis/geometry/Anchor", [
    "../geometry/Point"
], function (Point) {
    return (function (Point) {
        function Anchor(x, y, angle, segment) {
            Point.call(this, x, y);
            this.angle = angle;
            if (segment !== undefined) {
                this.segment = segment;
            }
        }

        if (Point) Anchor.__proto__ = Point;
        Anchor.prototype = Object.create(Point && Point.prototype);
        Anchor.prototype.constructor = Anchor;
        /**
         * 锚点克隆
         */
        Anchor.prototype.clone = function clone() {
            return new Anchor(this.x, this.y, this.angle, this.segment);
        };

        return Anchor;
    }(Point));
});