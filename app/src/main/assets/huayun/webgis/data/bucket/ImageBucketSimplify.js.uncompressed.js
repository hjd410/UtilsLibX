define("com/huayun/webgis/data/bucket/ImageBucketSimplify", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../geometry/Anchor",
    "../../geometry/Point2D"
], function (ArrayType, SegmentVector, Anchor, Point) {
    function addVertex$1(array, anchorX, anchorY, ox, oy, tx, ty) {
        array.emplaceBack(
            anchorX,
            anchorY, // a_pos
            Math.round(ox * 32),
            Math.round(oy * 32),
            tx, // x coordinate of symbol on glyph atlas texture
            ty // y coordinate of symbol on glyph atlas texture // a_pos_offset
        );
    }

    function shapeIcon(width, height, iconOffset) {
        var dx = iconOffset[0],
          dy = iconOffset[1];

        var x1 = dx - width * 0.5;
        var x2 = x1 + width;
        var y1 = dy - height * 0.5;
        var y2 = y1 + height;
        return {top: y1, bottom: y2, left: x1, right: x2};
    }

    function getIconQuads(anchor, shapedIcon, width, height) {
        var top = shapedIcon.top;
        var left = shapedIcon.left;
        var bottom = shapedIcon.bottom;
        var right = shapedIcon.right;
        var tl, tr, br, bl;
        tl = new Point(left, top);
        tr = new Point(right, top);
        br = new Point(right, bottom);
        bl = new Point(left, bottom);
        return [{tl: tl, tr: tr, bl: bl, br: br, tex: {x: 0, y: 0, w: width, h: height}}];
    }

    var ImageBucket = function ImageBucket() {
        this.layoutVertexArray = new ArrayType.StructArrayLayout2f4ib16();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.segments = new SegmentVector();
    };

    ImageBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.segments.destroy();
    };

    ImageBucket.prototype.addFeature = function(geometry, width, height, iconOffset) {
        var shapedIcon = shapeIcon(width, height, iconOffset);
        for (var i$6 = 0, list$6 = geometry; i$6 < list$6.length; i$6 += 1) {
            var points = list$6[i$6];
            for (var i = 0, list = points; i < list.length; i += 1) {
                var point = list[i];
                var anchor = new Anchor(point.x, point.y);
                var iconQuads = getIconQuads(anchor, shapedIcon, width, height);
                this.addSymbols(iconQuads, anchor);
            }
        }
    };

    ImageBucket.prototype.addSymbols = function addSymbols(quads, labelAnchor) {
        var indexArray = this.indexArray;
        var layoutVertexArray = this.layoutVertexArray;
        var segment = this.segments.prepareSegment(4 * quads.length, this.layoutVertexArray, this.indexArray);

        for (var i = 0, list = quads; i < list.length; i += 1) {
            var symbol = list[i];
            var tl = symbol.tl, tr = symbol.tr, bl = symbol.bl, br = symbol.br, tex = symbol.tex;
            var index = segment.vertexLength;
            addVertex$1(layoutVertexArray, labelAnchor.x, labelAnchor.y, tl.x, tl.y, tex.x, tex.y);
            addVertex$1(layoutVertexArray, labelAnchor.x, labelAnchor.y, tr.x, tr.y, tex.x + tex.w, tex.y);
            addVertex$1(layoutVertexArray, labelAnchor.x, labelAnchor.y, bl.x, bl.y, tex.x, tex.y + tex.h);
            addVertex$1(layoutVertexArray, labelAnchor.x, labelAnchor.y, br.x, br.y, tex.x + tex.w, tex.y + tex.h);
            indexArray.emplaceBack(index, index + 1, index + 2);
            indexArray.emplaceBack(index + 1, index + 2, index + 3);
            segment.vertexLength += 4;
            segment.primitiveLength += 2;
        }
    };

    ImageBucket.prototype.upload = function upload(context) {
        this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, [
            {name: "a_pos", type: "Float32", components: 2, offset: 0},
            {name: "a_data", type: "Int16", components: 4, offset: 8}
        ]);
        this.indexBuffer = context.createIndexBuffer(this.indexArray);
    };

    return ImageBucket;
});