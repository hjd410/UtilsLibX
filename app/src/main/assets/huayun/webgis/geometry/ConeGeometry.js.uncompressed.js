define("com/huayun/webgis/geometry/ConeGeometry", [
    "./Point"
], function (Point) {
    var DEFAULT_RADIUS = 1,
        DEFAULT_HEIGHT = 1,
        DEFAULT_SLICES = 30;

    function ConeGeometry(options) {
        this.radius = options.radius || DEFAULT_RADIUS;
        this.length = options.length || DEFAULT_HEIGHT;
        this.slices = options.slices || DEFAULT_SLICES;
        this.position = options.position || new Point(0, 0, 0);
    }

    return ConeGeometry;
})