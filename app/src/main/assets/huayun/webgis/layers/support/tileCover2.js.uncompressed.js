define("com/huayun/webgis/layers/support/tileCover2", [
    "exports",
    "require"
], function (exports, require) {
    function edge(a, b) {
        if (a.y > b.y) {
            var t = a;
            a = b;
            b = t;
        }
        return {
            x0: a.x,
            y0: a.y,
            x1: b.x,
            y1: b.y,
            dx: b.x - a.x,
            dy: b.y - a.y
        }
    }

    function scanSpans(e0, e1, ymin, ymax, scanLine) {
        var y0 = Math.max(ymin, Math.floor(e1.y0));
        var y1 = Math.min(ymax, Math.ceil(e1.y1));

        if ((e0.x0 === e1.x0 && e0.y0 === e1.y0) ?
            (e0.x0 + e1.dy/e0.dy*e0.dx < e1.x1) :
            (e0.x1 - e1.dy/e0.dy*e0.dx < e1.x0)) {
            var t = e0;
            e0 = e1;
            e1 = t;
        }

        var m0 = e0.dx/e0.dy;
        var m1 = e1.dx/e1.dy;
        var d0 = e0.dx > 0;
        var d1 = e1.dx < 0;
        for (var y = y0; y < y1; y++) {
            var x0 = m0 * Math.max(0, Math.min(e0.dy, y + d0 - e0.y0)) + e0.x0;
            var x1 = m1 * Math.max(0, Math.min(e1.dy, y+d1-e1.y0)) + e1.x0;
            scanLine(Math.floor(x1), Math.ceil(x0), y);
        }
    }

    function scanTriangle(a, b, c, ymin, ymax, scanLine) {
        var ab = edge(a, b),
            bc = edge(b, c),
            ca = edge(c, a);
        var t;
        if (ab.dy > bc.dy) {
            t = ab;
            ab = bc;
            bc = t;
        }
        if (ab.dy > ca.dy) {
            t = ab;
            ab = ca;
            ca = t;
        }
        if (bc.dy > ca.dy) {
            t = bc;
            bc = ca;
            ca = t;
        }

        if (ab.dy) {
            scanSpans(ca, ab, ymin, ymax, scanLine);
        }
        if (bc.dy) {
            scanSpans(ca, bc, ymin, ymax, scanLine);
        }
    }

    exports.tileCover = function (z, bounds, tileRange) {
        var t = {};

        function scanLine(x0, x1, y) {
            var x, w, wx, coord;
            /*if (y >= tileRange[0] && y <= tileRange[1]) {
                for (x = x0; x < x1; x++) {
                    w = Math.floor(x);
                    coord = {
                        z: z,
                        x: w,
                        y:y
                    };
                    t[z+"/"+w+"/"+y] = coord;
                }
            }*/
            for (x = x0; x < x1; x++) {
                w = Math.floor(x);
                coord = {
                    z: z,
                    x: w,
                    y:y
                };
                t[z+"/"+w+"/"+y] = coord;
            }
        }
        scanTriangle(bounds[0], bounds[1], bounds[2], tileRange[0], tileRange[1], scanLine);
        scanTriangle(bounds[2], bounds[3], bounds[0], tileRange[0], tileRange[1], scanLine);
        return t;
    }
});