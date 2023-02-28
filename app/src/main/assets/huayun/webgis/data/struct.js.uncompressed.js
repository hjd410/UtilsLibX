define("com/huayun/webgis/data/struct", [
    "exports"
], function (exports) {
    var Struct = function Struct(structArray, index) {
        (this)._structArray = structArray;
        this._pos1 = index * this.size;
        this._pos2 = this._pos1 / 2;
        this._pos4 = this._pos1 / 4;
        this._pos8 = this._pos1 / 8;
    };

    var SymbolInstanceStruct = (function (Struct) {
        function SymbolInstanceStruct() {
            Struct.apply(this, arguments);
        }

        if (Struct) SymbolInstanceStruct.__proto__ = Struct;
        SymbolInstanceStruct.prototype = Object.create(Struct && Struct.prototype);
        SymbolInstanceStruct.prototype.constructor = SymbolInstanceStruct;

        var prototypeAccessors$2 = {
            anchorX: {configurable: true},
            anchorY: {configurable: true},
            rightJustifiedTextSymbolIndex: {configurable: true},
            centerJustifiedTextSymbolIndex: {configurable: true},
            leftJustifiedTextSymbolIndex: {configurable: true},
            verticalPlacedTextSymbolIndex: {configurable: true},
            key: {configurable: true},
            textBoxStartIndex: {configurable: true},
            textBoxEndIndex: {configurable: true},
            iconBoxStartIndex: {configurable: true},
            iconBoxEndIndex: {configurable: true},
            featureIndex: {configurable: true},
            numHorizontalGlyphVertices: {configurable: true},
            numVerticalGlyphVertices: {configurable: true},
            numIconVertices: {configurable: true},
            crossTileID: {configurable: true},
            textBoxScale: {configurable: true},
            radialTextOffset: {configurable: true}
        };

        prototypeAccessors$2.anchorX.get = function () {
            return this._structArray.int16[this._pos2 + 0];
        };
        prototypeAccessors$2.anchorX.set = function (x) {
            this._structArray.int16[this._pos2 + 0] = x;
        };
        prototypeAccessors$2.anchorY.get = function () {
            return this._structArray.int16[this._pos2 + 1];
        };
        prototypeAccessors$2.anchorY.set = function (x) {
            this._structArray.int16[this._pos2 + 1] = x;
        };
        prototypeAccessors$2.rightJustifiedTextSymbolIndex.get = function () {
            return this._structArray.int16[this._pos2 + 2];
        };
        prototypeAccessors$2.rightJustifiedTextSymbolIndex.set = function (x) {
            this._structArray.int16[this._pos2 + 2] = x;
        };
        prototypeAccessors$2.centerJustifiedTextSymbolIndex.get = function () {
            return this._structArray.int16[this._pos2 + 3];
        };
        prototypeAccessors$2.centerJustifiedTextSymbolIndex.set = function (x) {
            this._structArray.int16[this._pos2 + 3] = x;
        };
        prototypeAccessors$2.leftJustifiedTextSymbolIndex.get = function () {
            return this._structArray.int16[this._pos2 + 4];
        };
        prototypeAccessors$2.leftJustifiedTextSymbolIndex.set = function (x) {
            this._structArray.int16[this._pos2 + 4] = x;
        };
        prototypeAccessors$2.verticalPlacedTextSymbolIndex.get = function () {
            return this._structArray.int16[this._pos2 + 5];
        };
        prototypeAccessors$2.verticalPlacedTextSymbolIndex.set = function (x) {
            this._structArray.int16[this._pos2 + 5] = x;
        };
        prototypeAccessors$2.key.get = function () {
            return this._structArray.uint16[this._pos2 + 6];
        };
        prototypeAccessors$2.key.set = function (x) {
            this._structArray.uint16[this._pos2 + 6] = x;
        };
        prototypeAccessors$2.textBoxStartIndex.get = function () {
            return this._structArray.uint16[this._pos2 + 7];
        };
        prototypeAccessors$2.textBoxStartIndex.set = function (x) {
            this._structArray.uint16[this._pos2 + 7] = x;
        };
        prototypeAccessors$2.textBoxEndIndex.get = function () {
            return this._structArray.uint16[this._pos2 + 8];
        };
        prototypeAccessors$2.textBoxEndIndex.set = function (x) {
            this._structArray.uint16[this._pos2 + 8] = x;
        };
        prototypeAccessors$2.iconBoxStartIndex.get = function () {
            return this._structArray.uint16[this._pos2 + 9];
        };
        prototypeAccessors$2.iconBoxStartIndex.set = function (x) {
            this._structArray.uint16[this._pos2 + 9] = x;
        };
        prototypeAccessors$2.iconBoxEndIndex.get = function () {
            return this._structArray.uint16[this._pos2 + 10];
        };
        prototypeAccessors$2.iconBoxEndIndex.set = function (x) {
            this._structArray.uint16[this._pos2 + 10] = x;
        };
        prototypeAccessors$2.featureIndex.get = function () {
            return this._structArray.uint16[this._pos2 + 11];
        };
        prototypeAccessors$2.featureIndex.set = function (x) {
            this._structArray.uint16[this._pos2 + 11] = x;
        };
        prototypeAccessors$2.numHorizontalGlyphVertices.get = function () {
            return this._structArray.uint16[this._pos2 + 12];
        };
        prototypeAccessors$2.numHorizontalGlyphVertices.set = function (x) {
            this._structArray.uint16[this._pos2 + 12] = x;
        };
        prototypeAccessors$2.numVerticalGlyphVertices.get = function () {
            return this._structArray.uint16[this._pos2 + 13];
        };
        prototypeAccessors$2.numVerticalGlyphVertices.set = function (x) {
            this._structArray.uint16[this._pos2 + 13] = x;
        };
        prototypeAccessors$2.numIconVertices.get = function () {
            return this._structArray.uint16[this._pos2 + 14];
        };
        prototypeAccessors$2.numIconVertices.set = function (x) {
            this._structArray.uint16[this._pos2 + 14] = x;
        };
        prototypeAccessors$2.crossTileID.get = function () {
            return this._structArray.uint32[this._pos4 + 8];
        };
        prototypeAccessors$2.crossTileID.set = function (x) {
            this._structArray.uint32[this._pos4 + 8] = x;
        };
        prototypeAccessors$2.textBoxScale.get = function () {
            return this._structArray.float32[this._pos4 + 9];
        };
        prototypeAccessors$2.textBoxScale.set = function (x) {
            this._structArray.float32[this._pos4 + 9] = x;
        };
        prototypeAccessors$2.radialTextOffset.get = function () {
            return this._structArray.float32[this._pos4 + 10];
        };
        prototypeAccessors$2.radialTextOffset.set = function (x) {
            this._structArray.float32[this._pos4 + 10] = x;
        };

        Object.defineProperties(SymbolInstanceStruct.prototype, prototypeAccessors$2);

        return SymbolInstanceStruct;
    }(Struct));
    SymbolInstanceStruct.prototype.size = 44;

    var PlacedSymbolStruct = (function (Struct) {
        function PlacedSymbolStruct() {
            Struct.apply(this, arguments);
        }

        if (Struct) PlacedSymbolStruct.__proto__ = Struct;
        PlacedSymbolStruct.prototype = Object.create(Struct && Struct.prototype);
        PlacedSymbolStruct.prototype.constructor = PlacedSymbolStruct;

        var prototypeAccessors$1 = {
            anchorX: {configurable: true},
            anchorY: {configurable: true},
            glyphStartIndex: {configurable: true},
            numGlyphs: {configurable: true},
            vertexStartIndex: {configurable: true},
            lineStartIndex: {configurable: true},
            lineLength: {configurable: true},
            segment: {configurable: true},
            lowerSize: {configurable: true},
            upperSize: {configurable: true},
            lineOffsetX: {configurable: true},
            lineOffsetY: {configurable: true},
            writingMode: {configurable: true},
            hidden: {configurable: true},
            crossTileID: {configurable: true}
        };

        prototypeAccessors$1.anchorX.get = function () {
            return this._structArray.int16[this._pos2 + 0];
        };
        prototypeAccessors$1.anchorX.set = function (x) {
            this._structArray.int16[this._pos2 + 0] = x;
        };
        prototypeAccessors$1.anchorY.get = function () {
            return this._structArray.int16[this._pos2 + 1];
        };
        prototypeAccessors$1.anchorY.set = function (x) {
            this._structArray.int16[this._pos2 + 1] = x;
        };
        prototypeAccessors$1.glyphStartIndex.get = function () {
            return this._structArray.uint16[this._pos2 + 2];
        };
        prototypeAccessors$1.glyphStartIndex.set = function (x) {
            this._structArray.uint16[this._pos2 + 2] = x;
        };
        prototypeAccessors$1.numGlyphs.get = function () {
            return this._structArray.uint16[this._pos2 + 3];
        };
        prototypeAccessors$1.numGlyphs.set = function (x) {
            this._structArray.uint16[this._pos2 + 3] = x;
        };
        prototypeAccessors$1.vertexStartIndex.get = function () {
            return this._structArray.uint32[this._pos4 + 2];
        };
        prototypeAccessors$1.vertexStartIndex.set = function (x) {
            this._structArray.uint32[this._pos4 + 2] = x;
        };
        prototypeAccessors$1.lineStartIndex.get = function () {
            return this._structArray.uint32[this._pos4 + 3];
        };
        prototypeAccessors$1.lineStartIndex.set = function (x) {
            this._structArray.uint32[this._pos4 + 3] = x;
        };
        prototypeAccessors$1.lineLength.get = function () {
            return this._structArray.uint32[this._pos4 + 4];
        };
        prototypeAccessors$1.lineLength.set = function (x) {
            this._structArray.uint32[this._pos4 + 4] = x;
        };
        prototypeAccessors$1.segment.get = function () {
            return this._structArray.uint16[this._pos2 + 10];
        };
        prototypeAccessors$1.segment.set = function (x) {
            this._structArray.uint16[this._pos2 + 10] = x;
        };
        prototypeAccessors$1.lowerSize.get = function () {
            return this._structArray.uint16[this._pos2 + 11];
        };
        prototypeAccessors$1.lowerSize.set = function (x) {
            this._structArray.uint16[this._pos2 + 11] = x;
        };
        prototypeAccessors$1.upperSize.get = function () {
            return this._structArray.uint16[this._pos2 + 12];
        };
        prototypeAccessors$1.upperSize.set = function (x) {
            this._structArray.uint16[this._pos2 + 12] = x;
        };
        prototypeAccessors$1.lineOffsetX.get = function () {
            return this._structArray.float32[this._pos4 + 7];
        };
        prototypeAccessors$1.lineOffsetX.set = function (x) {
            this._structArray.float32[this._pos4 + 7] = x;
        };
        prototypeAccessors$1.lineOffsetY.get = function () {
            return this._structArray.float32[this._pos4 + 8];
        };
        prototypeAccessors$1.lineOffsetY.set = function (x) {
            this._structArray.float32[this._pos4 + 8] = x;
        };
        prototypeAccessors$1.writingMode.get = function () {
            return this._structArray.uint8[this._pos1 + 36];
        };
        prototypeAccessors$1.writingMode.set = function (x) {
            this._structArray.uint8[this._pos1 + 36] = x;
        };
        prototypeAccessors$1.hidden.get = function () {
            return this._structArray.uint8[this._pos1 + 37];
        };
        prototypeAccessors$1.hidden.set = function (x) {
            this._structArray.uint8[this._pos1 + 37] = x;
        };
        prototypeAccessors$1.crossTileID.get = function () {
            return this._structArray.uint32[this._pos4 + 10];
        };
        prototypeAccessors$1.crossTileID.set = function (x) {
            this._structArray.uint32[this._pos4 + 10] = x;
        };

        Object.defineProperties(PlacedSymbolStruct.prototype, prototypeAccessors$1);

        return PlacedSymbolStruct;
    }(Struct));

    PlacedSymbolStruct.prototype.size = 44;

    var CollisionBoxStruct = (function (Struct) {
        function CollisionBoxStruct() {
            Struct.apply(this, arguments);
        }

        if (Struct) CollisionBoxStruct.__proto__ = Struct;
        CollisionBoxStruct.prototype = Object.create(Struct && Struct.prototype);
        CollisionBoxStruct.prototype.constructor = CollisionBoxStruct;

        var prototypeAccessors = {
            anchorPointX: {configurable: true},
            anchorPointY: {configurable: true},
            x1: {configurable: true},
            y1: {configurable: true},
            x2: {configurable: true},
            y2: {configurable: true},
            featureIndex: {configurable: true},
            sourceLayerIndex: {configurable: true},
            bucketIndex: {configurable: true},
            radius: {configurable: true},
            signedDistanceFromAnchor: {configurable: true},
            anchorPoint: {configurable: true}
        };

        prototypeAccessors.anchorPointX.get = function () {
            return this._structArray.int16[this._pos2 + 0];
        };
        prototypeAccessors.anchorPointX.set = function (x) {
            this._structArray.int16[this._pos2 + 0] = x;
        };
        prototypeAccessors.anchorPointY.get = function () {
            return this._structArray.int16[this._pos2 + 1];
        };
        prototypeAccessors.anchorPointY.set = function (x) {
            this._structArray.int16[this._pos2 + 1] = x;
        };
        prototypeAccessors.x1.get = function () {
            return this._structArray.int16[this._pos2 + 2];
        };
        prototypeAccessors.x1.set = function (x) {
            this._structArray.int16[this._pos2 + 2] = x;
        };
        prototypeAccessors.y1.get = function () {
            return this._structArray.int16[this._pos2 + 3];
        };
        prototypeAccessors.y1.set = function (x) {
            this._structArray.int16[this._pos2 + 3] = x;
        };
        prototypeAccessors.x2.get = function () {
            return this._structArray.int16[this._pos2 + 4];
        };
        prototypeAccessors.x2.set = function (x) {
            this._structArray.int16[this._pos2 + 4] = x;
        };
        prototypeAccessors.y2.get = function () {
            return this._structArray.int16[this._pos2 + 5];
        };
        prototypeAccessors.y2.set = function (x) {
            this._structArray.int16[this._pos2 + 5] = x;
        };
        prototypeAccessors.featureIndex.get = function () {
            return this._structArray.uint32[this._pos4 + 3];
        };
        prototypeAccessors.featureIndex.set = function (x) {
            this._structArray.uint32[this._pos4 + 3] = x;
        };
        prototypeAccessors.sourceLayerIndex.get = function () {
            return this._structArray.uint16[this._pos2 + 8];
        };
        prototypeAccessors.sourceLayerIndex.set = function (x) {
            this._structArray.uint16[this._pos2 + 8] = x;
        };
        prototypeAccessors.bucketIndex.get = function () {
            return this._structArray.uint16[this._pos2 + 9];
        };
        prototypeAccessors.bucketIndex.set = function (x) {
            this._structArray.uint16[this._pos2 + 9] = x;
        };
        prototypeAccessors.radius.get = function () {
            return this._structArray.int16[this._pos2 + 10];
        };
        prototypeAccessors.radius.set = function (x) {
            this._structArray.int16[this._pos2 + 10] = x;
        };
        prototypeAccessors.signedDistanceFromAnchor.get = function () {
            return this._structArray.int16[this._pos2 + 11];
        };
        prototypeAccessors.signedDistanceFromAnchor.set = function (x) {
            this._structArray.int16[this._pos2 + 11] = x;
        };
        prototypeAccessors.anchorPoint.get = function () {
            return new pointGeometry(this.anchorPointX, this.anchorPointY);
        };

        Object.defineProperties(CollisionBoxStruct.prototype, prototypeAccessors);

        return CollisionBoxStruct;
    }(Struct));

    CollisionBoxStruct.prototype.size = 24;

    var FeatureIndexStruct = (function (Struct) {
        function FeatureIndexStruct () {
            Struct.apply(this, arguments);
        }

        if ( Struct ) FeatureIndexStruct.__proto__ = Struct;
        FeatureIndexStruct.prototype = Object.create( Struct && Struct.prototype );
        FeatureIndexStruct.prototype.constructor = FeatureIndexStruct;

        var prototypeAccessors$5 = { featureIndex: { configurable: true },sourceLayerIndex: { configurable: true },bucketIndex: { configurable: true } };

        prototypeAccessors$5.featureIndex.get = function () { return this._structArray.uint32[this._pos4 + 0]; };
        prototypeAccessors$5.featureIndex.set = function (x        ) { this._structArray.uint32[this._pos4 + 0] = x; };
        prototypeAccessors$5.sourceLayerIndex.get = function () { return this._structArray.uint16[this._pos2 + 2]; };
        prototypeAccessors$5.sourceLayerIndex.set = function (x        ) { this._structArray.uint16[this._pos2 + 2] = x; };
        prototypeAccessors$5.bucketIndex.get = function () { return this._structArray.uint16[this._pos2 + 3]; };
        prototypeAccessors$5.bucketIndex.set = function (x        ) { this._structArray.uint16[this._pos2 + 3] = x; };

        Object.defineProperties( FeatureIndexStruct.prototype, prototypeAccessors$5 );

        return FeatureIndexStruct;
    }(Struct));

    FeatureIndexStruct.prototype.size = 8;

    // 模块导出子类使用
    exports.SymbolInstanceStruct = SymbolInstanceStruct;
    exports.PlacedSymbolStruct = PlacedSymbolStruct;
    exports.CollisionBoxStruct = CollisionBoxStruct;

    exports.FeatureIndexStruct = FeatureIndexStruct;
});