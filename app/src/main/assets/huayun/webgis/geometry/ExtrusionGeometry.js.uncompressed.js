define("com/huayun/webgis/geometry/ExtrusionGeometry", [], function () {

    function ExtrusionGeometry(params) {
        this.path = params.path;
        this.length = params.length;
    }

    return ExtrusionGeometry;
})