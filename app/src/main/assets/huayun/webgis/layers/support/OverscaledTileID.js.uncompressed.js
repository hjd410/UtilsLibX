define("com/huayun/webgis/layers/support/OverscaledTileID", [
    "./CanonicalTileID",
    "./funcUtils"
], function (CanonicalTileID, funcUtils) {

    var UnwrappedTileID = function UnwrappedTileID(wrap, canonical) {
        this.wrap = wrap;
        this.canonical = canonical;
        this.key = funcUtils.calculateKey(wrap, canonical.z, canonical.x, canonical.y);
    };

    var OverscaledTileID = function OverscaledTileID(overscaledZ, wrap, z, x, y) {
        this.overscaledZ = overscaledZ;
        this.wrap = wrap;
        this.canonical = new CanonicalTileID(z, +x, +y);
        this.key = funcUtils.calculateKey(wrap, overscaledZ, x, y);
    };

    OverscaledTileID.prototype.equals = function equals(id) {
        return this.overscaledZ === id.overscaledZ && this.wrap === id.wrap && this.canonical.equals(id.canonical);
    };

    OverscaledTileID.prototype.scaledTo = function scaledTo(targetZ) {
        var zDifference = this.canonical.z - targetZ;
        if (targetZ > this.canonical.z) {
            return new OverscaledTileID(targetZ, this.wrap, this.canonical.z, this.canonical.x, this.canonical.y);
        } else {
            return new OverscaledTileID(targetZ, this.wrap, targetZ, this.canonical.x >> zDifference, this.canonical.y >> zDifference);
        }
    };

    OverscaledTileID.prototype.isChildOf = function isChildOf(parent) {
        if (parent.wrap !== this.wrap) {
            // We can't be a child if we're in a different world copy
            return false;
        }
        var zDifference = this.canonical.z - parent.canonical.z;
        // We're first testing for z == 0, to avoid a 32 bit shift, which is undefined.
        return parent.overscaledZ === 0 || (
            parent.overscaledZ < this.overscaledZ &&
            parent.canonical.x === (this.canonical.x >> zDifference) &&
            parent.canonical.y === (this.canonical.y >> zDifference));
    };

    /**
     * 子切片的数据
     * @param sourceMaxZoom
     * @return {[OverscaledTileID, OverscaledTileID, OverscaledTileID, OverscaledTileID]|[OverscaledTileID]}
     */
    OverscaledTileID.prototype.children = function children(sourceMaxZoom) {
        if (this.overscaledZ >= sourceMaxZoom) {
            return [new OverscaledTileID(this.overscaledZ + 1, this.wrap, this.canonical.z, this.canonical.x, this.canonical.y)];
        }

        var z = this.canonical.z + 1;
        var x = this.canonical.x * 2;
        var y = this.canonical.y * 2;
        return [
            new OverscaledTileID(z, this.wrap, z, x, y),
            new OverscaledTileID(z, this.wrap, z, x + 1, y),
            new OverscaledTileID(z, this.wrap, z, x, y + 1),
            new OverscaledTileID(z, this.wrap, z, x + 1, y + 1)
        ];
    };

    OverscaledTileID.prototype.isLessThan = function isLessThan(rhs) {
        if (this.wrap < rhs.wrap) {
            return true;
        }
        if (this.wrap > rhs.wrap) {
            return false;
        }

        if (this.overscaledZ < rhs.overscaledZ) {
            return true;
        }
        if (this.overscaledZ > rhs.overscaledZ) {
            return false;
        }

        if (this.canonical.x < rhs.canonical.x) {
            return true;
        }
        if (this.canonical.x > rhs.canonical.x) {
            return false;
        }

        if (this.canonical.y < rhs.canonical.y) {
            return true;
        }
        return false;
    };

    OverscaledTileID.prototype.wrapped = function wrapped() {
        return new OverscaledTileID(this.overscaledZ, 0, this.canonical.z, this.canonical.x, this.canonical.y);
    };

    OverscaledTileID.prototype.unwrapTo = function unwrapTo(wrap) {
        return new OverscaledTileID(this.overscaledZ, wrap, this.canonical.z, this.canonical.x, this.canonical.y);
    };

    OverscaledTileID.prototype.overscaleFactor = function overscaleFactor() {
        return Math.pow(2, this.overscaledZ - this.canonical.z);
    };

    OverscaledTileID.prototype.toUnwrapped = function toUnwrapped() {
        return new UnwrappedTileID(this.wrap, this.canonical);
    };

    OverscaledTileID.prototype.toString = function toString() {
        return ((this.overscaledZ) + "/" + (this.canonical.x) + "/" + (this.canonical.y));
    };

    OverscaledTileID.prototype.getTilePoint = function getTilePoint(coord) {
        return this.canonical.getTilePoint(new MercatorCoordinate(coord.x - this.wrap, coord.y));
    };

    return OverscaledTileID;
});