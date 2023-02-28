define("com/huayun/webgis/layers/support/ZoomHistory", [], function () {
    var ZoomHistory = function ZoomHistory() {
        this.first = true;
    };
    ZoomHistory.prototype.update = function update(z, now) {
        var floorZ = Math.floor(z);

        if (this.first) {
            this.first = false;
            this.lastIntegerZoom = floorZ;
            this.lastIntegerZoomTime = 0;
            this.lastZoom = z;
            this.lastFloorZoom = floorZ;
            return true;
        }

        if (this.lastFloorZoom > floorZ) {
            this.lastIntegerZoom = floorZ + 1;
            this.lastIntegerZoomTime = now;
        } else if (this.lastFloorZoom < floorZ) {
            this.lastIntegerZoom = floorZ;
            this.lastIntegerZoomTime = now;
        }

        if (z !== this.lastZoom) {
            this.lastZoom = z;
            this.lastFloorZoom = floorZ;
            return true;
        }
        return false;
    };

    return ZoomHistory;
});