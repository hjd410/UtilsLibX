define("com/huayun/webgis/data/ArrayType", [
    "require",
    "exports",
    "./struct"
], function (e, f, struct) {
    Object.defineProperty(f, "__esModule", {value: !0});
    var DEFAULT_CAPACITY = 128;
    var RESIZE_MULTIPLIER = 5;
    e = function () {
        function StructArray() {
            this.isTransferred = false;
            this.capacity = -1;
            this.resize(0);
        }

        StructArray.serialize = function serialize(array, transferables) {
            array._trim();
            if (transferables) {
                array.isTransferred = true;
                transferables.push(array.arrayBuffer);
            }
            return {
                length: array.length,
                arrayBuffer: array.arrayBuffer
            };
        };
        /**
         * 反序列化期间，同步化原始数据和重构StructArray基类所需的元数据
         * @param input
         */
        StructArray.deserialize = function deserialize(input) {
            var structArray = Object.create(this.prototype);
            structArray.arrayBuffer = input.arrayBuffer;
            structArray.length = input.length;
            structArray.capacity = input.arrayBuffer.byteLength / structArray.bytesPerElement;
            structArray._refreshViews();
            return structArray;
        };
        /**
         * 调整array大小以丢弃未使用容量
         */
        StructArray.prototype._trim = function _trim() {
            if (this.length !== this.capacity) {
                this.capacity = this.length;
                this.arrayBuffer = this.arrayBuffer.slice(0, this.length * this.bytesPerElement);
                this._refreshViews();
            }
        };
        /**
         * 不取消分配容量情况下将数组长度重置为0
         */
        StructArray.prototype.clear = function clear() {
            this.length = 0;
        };
        /**
         * 调整array大小
         * 若n大于当前长度添加具有未定义值的其他元素。
         * 若n小于当前长度，则数组将减少至n个元素
         * @param {number} n 新数组大小
         */
        StructArray.prototype.resize = function resize(n) {
            this.reserve(n);
            this.length = n;
        };
        /**
         * Indicate a planned increase in size, so that any necessary allocation may be done once, ahead of time.
         * @param {number} n 数组期望大小.
         */
        StructArray.prototype.reserve = function reserve(n) {
            if (n > this.capacity) {
                this.capacity = Math.max(n, Math.floor(this.capacity * RESIZE_MULTIPLIER), DEFAULT_CAPACITY);
                this.arrayBuffer = new ArrayBuffer(this.capacity * this.bytesPerElement);
                var oldUint8Array = this.uint8;
                this._refreshViews();
                if (oldUint8Array) {
                    this.uint8.set(oldUint8Array);
                }
            }
        };
        /**
         * Create TypedArray views for the current ArrayBuffer.
         */
        StructArray.prototype._refreshViews = function _refreshViews() {
            throw new Error('_refreshViews() must be implemented by each concrete StructArray layout');
        };

        return StructArray;
    }();
    f.StructArray = e;
    var array = function (StructArray) {
        function StructArrayLayout2i4() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2i4.__proto__ = StructArray;
        StructArrayLayout2i4.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2i4.prototype.constructor = StructArrayLayout2i4;

        StructArrayLayout2i4.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
        };

        StructArrayLayout2i4.prototype.emplaceBack = function emplaceBack(v0, v1) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1);
        };

        StructArrayLayout2i4.prototype.emplace = function emplace(i, v0, v1) {
            var o2 = i * 2;
            this.int16[o2] = v0;
            this.int16[o2 + 1] = v1;
            return i;
        };

        return StructArrayLayout2i4;
    }(e);
    array.prototype.bytesPerElement = 4;
    f.StructArrayLayout2i4 = array;

    array = function (StructArray) {
        function StructArrayLayout2ui4() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2ui4.__proto__ = StructArray;
        StructArrayLayout2ui4.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2ui4.prototype.constructor = StructArrayLayout2ui4;

        StructArrayLayout2ui4.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.uint16 = new Uint16Array(this.arrayBuffer);
        };

        StructArrayLayout2ui4.prototype.emplaceBack = function emplaceBack(v0, v1) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1);
        };

        StructArrayLayout2ui4.prototype.emplace = function emplace(i, v0, v1) {
            var o2 = i * 2;
            this.uint16[o2] = v0;
            this.uint16[o2 + 1] = v1;
            return i;
        };

        return StructArrayLayout2ui4;
    }(e);
    array.prototype.bytesPerElement = 4;
    f.StructArrayLayout2ui4 = array;

    array = function (StructArray) {
        function StructArrayLayout2i8() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2i8.__proto__ = StructArray;
        StructArrayLayout2i8.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2i8.prototype.constructor = StructArrayLayout2i8;

        StructArrayLayout2i8.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int32 = new Int32Array(this.arrayBuffer);
        };

        StructArrayLayout2i8.prototype.emplaceBack = function emplaceBack(v0, v1) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1);
        };

        StructArrayLayout2i8.prototype.emplace = function emplace(i, v0, v1) {
            var o2 = i * 2;
            this.int32[o2] = v0;
            this.int32[o2 + 1] = v1;
            return i;
        };

        return StructArrayLayout2i8;
    }(e);
    array.prototype.bytesPerElement = 8;
    f.StructArrayLayout2i8 = array;

    array = function (StructArray) {
        function StructArrayLayout2i4ub8() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2i4ub8.__proto__ = StructArray;
        StructArrayLayout2i4ub8.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2i4ub8.prototype.constructor = StructArrayLayout2i4ub8;

        StructArrayLayout2i4ub8.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
        };

        StructArrayLayout2i4ub8.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5);
        };

        StructArrayLayout2i4ub8.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5) {
            var o2 = i * 4;
            var o1 = i * 8;
            this.int16[o2] = v0;
            this.int16[o2 + 1] = v1;
            this.uint8[o1 + 4] = v2;
            this.uint8[o1 + 5] = v3;
            this.uint8[o1 + 6] = v4;
            this.uint8[o1 + 7] = v5;
            return i;
        };

        return StructArrayLayout2i4ub8;
    }(e);
    array.prototype.bytesPerElement = 8;
    f.StructArrayLayout2i4ub8 = array;

    array = function (StructArray) {
        function StructArrayLayout4i4ui16() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout4i4ui16.__proto__ = StructArray;
        StructArrayLayout4i4ui16.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout4i4ui16.prototype.constructor = StructArrayLayout4i4ui16;

        StructArrayLayout4i4ui16.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
            this.uint16 = new Uint16Array(this.arrayBuffer);
        };

        StructArrayLayout4i4ui16.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5, v6, v7);
        };

        StructArrayLayout4i4ui16.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5, v6, v7) {
            var o2 = i * 8;
            this.int16[o2 + 0] = v0;
            this.int16[o2 + 1] = v1;
            this.int16[o2 + 2] = v2;
            this.int16[o2 + 3] = v3;
            this.uint16[o2 + 4] = v4;
            this.uint16[o2 + 5] = v5;
            this.uint16[o2 + 6] = v6;
            this.uint16[o2 + 7] = v7;
            return i;
        };

        return StructArrayLayout4i4ui16;
    }(e);

    array.prototype.bytesPerElement = 16;
    f.StructArrayLayout4i4ui16 = array;

    array = function (StructArray) {
        function StructArrayLayout3ui6() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout3ui6.__proto__ = StructArray;
        StructArrayLayout3ui6.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout3ui6.prototype.constructor = StructArrayLayout3ui6;

        StructArrayLayout3ui6.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.uint16 = new Uint16Array(this.arrayBuffer);
        };

        StructArrayLayout3ui6.prototype.emplaceBack = function emplaceBack(v0, v1, v2) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2);
        };

        StructArrayLayout3ui6.prototype.emplace = function emplace(i, v0, v1, v2) {
            var o2 = i * 3;
            this.uint16[o2 + 0] = v0;
            this.uint16[o2 + 1] = v1;
            this.uint16[o2 + 2] = v2;
            return i;
        };

        return StructArrayLayout3ui6;
    }(e);
    array.prototype.bytesPerElement = 6;
    f.StructArrayLayout3ui6 = array;

    array = function (StructArray) {
        function StructArrayLayout3ui12() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout3ui12.__proto__ = StructArray;
        StructArrayLayout3ui12.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout3ui12.prototype.constructor = StructArrayLayout3ui12;

        StructArrayLayout3ui12.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.uint32 = new Uint32Array(this.arrayBuffer);
        };

        StructArrayLayout3ui12.prototype.emplaceBack = function emplaceBack(v0, v1, v2) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2);
        };

        StructArrayLayout3ui12.prototype.emplace = function emplace(i, v0, v1, v2) {
            var o2 = i * 3;
            this.uint32[o2 + 0] = v0;
            this.uint32[o2 + 1] = v1;
            this.uint32[o2 + 2] = v2;
            return i;
        };

        return StructArrayLayout3ui12;
    }(e);
    array.prototype.bytesPerElement = 12;
    f.StructArrayLayout3ui12 = array;

    array = function (StructArray) {
        function StructArrayLayout3f12() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout3f12.__proto__ = StructArray;
        StructArrayLayout3f12.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout3f12.prototype.constructor = StructArrayLayout3f12;

        StructArrayLayout3f12.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout3f12.prototype.emplaceBack = function emplaceBack(v0, v1, v2) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2);
        };

        StructArrayLayout3f12.prototype.emplace = function emplace(i, v0, v1, v2) {
            var o4 = i * 3;
            this.float32[o4 + 0] = v0;
            this.float32[o4 + 1] = v1;
            this.float32[o4 + 2] = v2;
            return i;
        };

        return StructArrayLayout3f12;
    }(e);

    array.prototype.bytesPerElement = 12;
    f.StructArrayLayout3f12 = array;

    array = function (StructArray) {
        function StructArrayLayout1ul4() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout1ul4.__proto__ = StructArray;
        StructArrayLayout1ul4.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout1ul4.prototype.constructor = StructArrayLayout1ul4;

        StructArrayLayout1ul4.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.uint32 = new Uint32Array(this.arrayBuffer);
        };

        StructArrayLayout1ul4.prototype.emplaceBack = function emplaceBack(v0) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0);
        };

        StructArrayLayout1ul4.prototype.emplace = function emplace(i, v0) {
            var o4 = i * 1;
            this.uint32[o4 + 0] = v0;
            return i;
        };

        return StructArrayLayout1ul4;
    }(e);

    array.prototype.bytesPerElement = 4;
    f.StructArrayLayout1ul4 = array;

    array = function (StructArray) {
        function StructArrayLayout2i4ub12() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2i4ub12.__proto__ = StructArray;
        StructArrayLayout2i4ub12.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2i4ub12.prototype.constructor = StructArrayLayout2i4ub12;

        StructArrayLayout2i4ub12.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            // this.int16 = new Int16Array(this.arrayBuffer);
            this.int32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout2i4ub12.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5);
        };

        StructArrayLayout2i4ub12.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5) {
            var o2 = i * 3;
            var o1 = i * 12;
            this.int32[o2] = v0;
            this.int32[o2 + 1] = v1;
            this.uint8[o1 + 8] = v2;
            this.uint8[o1 + 9] = v3;
            this.uint8[o1 + 10] = v4;
            this.uint8[o1 + 11] = v5;
            return i;
        };

        return StructArrayLayout2i4ub12;
    }(e);
    array.prototype.bytesPerElement = 12;
    f.StructArrayLayout2i4ub12 = array;

    array = function (StructArray) {
        function StructArrayLayout2i2ui3ul3ui2f2ub1ul44() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2i2ui3ul3ui2f2ub1ul44.__proto__ = StructArray;
        StructArrayLayout2i2ui3ul3ui2f2ub1ul44.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2i2ui3ul3ui2f2ub1ul44.prototype.constructor = StructArrayLayout2i2ui3ul3ui2f2ub1ul44;

        StructArrayLayout2i2ui3ul3ui2f2ub1ul44.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
            this.uint16 = new Uint16Array(this.arrayBuffer);
            this.uint32 = new Uint32Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout2i2ui3ul3ui2f2ub1ul44.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14);
        };

        StructArrayLayout2i2ui3ul3ui2f2ub1ul44.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14) {
            var o2 = i * 22;
            var o4 = i * 11;
            var o1 = i * 44;
            this.int16[o2 + 0] = v0;
            this.int16[o2 + 1] = v1;
            this.uint16[o2 + 2] = v2;
            this.uint16[o2 + 3] = v3;
            this.uint32[o4 + 2] = v4;
            this.uint32[o4 + 3] = v5;
            this.uint32[o4 + 4] = v6;
            this.uint16[o2 + 10] = v7;
            this.uint16[o2 + 11] = v8;
            this.uint16[o2 + 12] = v9;
            this.float32[o4 + 7] = v10;
            this.float32[o4 + 8] = v11;
            this.uint8[o1 + 36] = v12;
            this.uint8[o1 + 37] = v13;
            this.uint32[o4 + 10] = v14;
            return i;
        };

        return StructArrayLayout2i2ui3ul3ui2f2ub1ul44;
    }(e);

    array.prototype.bytesPerElement = 44;
    f.StructArrayLayout2i2ui3ul3ui2f2ub1ul44 = array;

    array = function (StructArray) {
        function StructArrayLayout2ub2f12() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2ub2f12.__proto__ = StructArray;
        StructArrayLayout2ub2f12.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2ub2f12.prototype.constructor = StructArrayLayout2ub2f12;

        StructArrayLayout2ub2f12.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout2ub2f12.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3);
        };

        StructArrayLayout2ub2f12.prototype.emplace = function emplace(i, v0, v1, v2, v3) {
            var o1 = i * 12;
            var o4 = i * 3;
            this.uint8[o1 + 0] = v0;
            this.uint8[o1 + 1] = v1;
            this.float32[o4 + 1] = v2;
            this.float32[o4 + 2] = v3;
            return i;
        };

        return StructArrayLayout2ub2f12;
    }(e);

    array.prototype.bytesPerElement = 12;
    f.StructArrayLayout2ub2f12 = array;

    array = (function (StructArray) {
        function StructArrayLayout2i2i2i12() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2i2i2i12.__proto__ = StructArray;
        StructArrayLayout2i2i2i12.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2i2i2i12.prototype.constructor = StructArrayLayout2i2i2i12;

        StructArrayLayout2i2i2i12.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
        };

        StructArrayLayout2i2i2i12.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5);
        };

        StructArrayLayout2i2i2i12.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5) {
            var o2 = i * 6;
            this.int16[o2 + 0] = v0;
            this.int16[o2 + 1] = v1;
            this.int16[o2 + 2] = v2;
            this.int16[o2 + 3] = v3;
            this.int16[o2 + 4] = v4;
            this.int16[o2 + 5] = v5;
            return i;
        };

        return StructArrayLayout2i2i2i12;
    }(e));
    array.prototype.bytesPerElement = 12;
    f.StructArrayLayout2i2i2i12 = array;

    array = function (StructArray) {
        function StructArrayLayout6fb24() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout6fb24.__proto__ = StructArray;
        StructArrayLayout6fb24.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout6fb24.prototype.constructor = StructArrayLayout6fb24;

        StructArrayLayout6fb24.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Float32Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout6fb24.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5);
        };

        StructArrayLayout6fb24.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5) {
            var o1 = i * 6;
            this.float32[o1 + 0] = v0;
            this.float32[o1 + 1] = v1;
            this.float32[o1 + 2] = v2;
            this.float32[o1 + 3] = v3;
            this.float32[o1 + 4] = v4;
            this.float32[o1 + 5] = v5;
            return i;
        };

        return StructArrayLayout6fb24;
    }(e);
    array.prototype.bytesPerElement = 24;
    f.StructArrayLayout6fb24 = array;


    array = function (StructArray) {
        function StructArrayLayout6f2ib28() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout6f2ib28.__proto__ = StructArray;
        StructArrayLayout6f2ib28.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout6f2ib28.prototype.constructor = StructArrayLayout6f2ib28;

        StructArrayLayout6f2ib28.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Float32Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer)
        };

        StructArrayLayout6f2ib28.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5, v6, v7);
        };

        StructArrayLayout6f2ib28.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5, v6, v7) {
            var o1 = i * 7;
            var o2 = i * 14;
            this.float32[o1 + 0] = v0;
            this.float32[o1 + 1] = v1;
            this.float32[o1 + 2] = v2;
            this.float32[o1 + 3] = v3;
            this.float32[o1 + 4] = v4;
            this.float32[o1 + 5] = v5;
            this.int16[o2 + 12] = v6;
            this.int16[o2 + 13] = v7;
            return i;
        };

        return StructArrayLayout6f2ib28;
    }(e);
    array.prototype.bytesPerElement = 28;
    f.StructArrayLayout6f2ib28 = array;


    array = function (StructArray) {
        function StructArrayLayout7f2ib32() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout7f2ib32.__proto__ = StructArray;
        StructArrayLayout7f2ib32.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout7f2ib32.prototype.constructor = StructArrayLayout7f2ib32;

        StructArrayLayout7f2ib32.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Float32Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer)
        };

        StructArrayLayout7f2ib32.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7, v8) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8);
        };

        StructArrayLayout7f2ib32.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8) {
            var o1 = i * 8;
            var o2 = i * 16;
            this.float32[o1 + 0] = v0;
            this.float32[o1 + 1] = v1;
            this.float32[o1 + 2] = v2;
            this.float32[o1 + 3] = v3;
            this.float32[o1 + 4] = v4;
            this.float32[o1 + 5] = v5;
            this.float32[o1 + 6] = v6;
            this.int16[o2 + 14] = v7;
            this.int16[o2 + 15] = v8;
            return i;
        };

        return StructArrayLayout7f2ib32;
    }(e);
    array.prototype.bytesPerElement = 32;
    f.StructArrayLayout7f2ib32 = array;

    array = function (StructArray) {
        function StructArrayLayout7fb28() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout7fb28.__proto__ = StructArray;
        StructArrayLayout7fb28.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout7fb28.prototype.constructor = StructArrayLayout7fb28;

        StructArrayLayout7fb28.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Float32Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout7fb28.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5, v6) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5, v6);
        };

        StructArrayLayout7fb28.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5, v6) {
            var o1 = i * 7;
            this.float32[o1 + 0] = v0;
            this.float32[o1 + 1] = v1;
            this.float32[o1 + 2] = v2;
            this.float32[o1 + 3] = v3;
            this.float32[o1 + 4] = v4;
            this.float32[o1 + 5] = v5;
            this.float32[o1 + 6] = v6;
            return i;
        };

        return StructArrayLayout7fb28;
    }(e);
    array.prototype.bytesPerElement = 28;
    f.StructArrayLayout7fb28 = array;

    array = function (StructArray) {
        function StructArrayLayout6i1ul2ui2i24() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout6i1ul2ui2i24.__proto__ = StructArray;
        StructArrayLayout6i1ul2ui2i24.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout6i1ul2ui2i24.prototype.constructor = StructArrayLayout6i1ul2ui2i24;

        StructArrayLayout6i1ul2ui2i24.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
            this.uint32 = new Uint32Array(this.arrayBuffer);
            this.uint16 = new Uint16Array(this.arrayBuffer);
        };

        StructArrayLayout6i1ul2ui2i24.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10);
        };

        StructArrayLayout6i1ul2ui2i24.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10) {
            var o2 = i * 12;
            var o4 = i * 6;
            this.int16[o2 + 0] = v0;
            this.int16[o2 + 1] = v1;
            this.int16[o2 + 2] = v2;
            this.int16[o2 + 3] = v3;
            this.int16[o2 + 4] = v4;
            this.int16[o2 + 5] = v5;
            this.uint32[o4 + 3] = v6;
            this.uint16[o2 + 8] = v7;
            this.uint16[o2 + 9] = v8;
            this.int16[o2 + 10] = v9;
            this.int16[o2 + 11] = v10;
            return i;
        };

        return StructArrayLayout6i1ul2ui2i24;
    }(e);

    array.prototype.bytesPerElement = 24;
    f.StructArrayLayout6i1ul2ui2i24 = array;

    array = (function (StructArray) {
        function StructArrayLayout1f4() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout1f4.__proto__ = StructArray;
        StructArrayLayout1f4.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout1f4.prototype.constructor = StructArrayLayout1f4;

        StructArrayLayout1f4.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout1f4.prototype.emplaceBack = function emplaceBack(v0) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0);
        };

        StructArrayLayout1f4.prototype.emplace = function emplace(i, v0) {
            var o4 = i * 1;
            this.float32[o4 + 0] = v0;
            return i;
        };

        return StructArrayLayout1f4;
    }(e));
    array.prototype.bytesPerElement = 4;
    f.StructArrayLayout1f4 = array;

    array = (function (StructArray) {
        function StructArrayLayout3i6() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout3i6.__proto__ = StructArray;
        StructArrayLayout3i6.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout3i6.prototype.constructor = StructArrayLayout3i6;

        StructArrayLayout3i6.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
        };

        StructArrayLayout3i6.prototype.emplaceBack = function emplaceBack(v0, v1, v2) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2);
        };

        StructArrayLayout3i6.prototype.emplace = function emplace(i, v0, v1, v2) {
            var o2 = i * 3;
            this.int16[o2 + 0] = v0;
            this.int16[o2 + 1] = v1;
            this.int16[o2 + 2] = v2;
            return i;
        };

        return StructArrayLayout3i6;
    }(e));
    array.prototype.bytesPerElement = 6;
    f.StructArrayLayout3i6 = array;

    array = (function (StructArray) {
        function StructArrayLayout6i9ui1ul2f44() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout6i9ui1ul2f44.__proto__ = StructArray;
        StructArrayLayout6i9ui1ul2f44.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout6i9ui1ul2f44.prototype.constructor = StructArrayLayout6i9ui1ul2f44;

        StructArrayLayout6i9ui1ul2f44.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
            this.uint16 = new Uint16Array(this.arrayBuffer);
            this.uint32 = new Uint32Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout6i9ui1ul2f44.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17);
        };

        StructArrayLayout6i9ui1ul2f44.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17) {
            var o2 = i * 22;
            var o4 = i * 11;
            this.int16[o2 + 0] = v0;
            this.int16[o2 + 1] = v1;
            this.int16[o2 + 2] = v2;
            this.int16[o2 + 3] = v3;
            this.int16[o2 + 4] = v4;
            this.int16[o2 + 5] = v5;
            this.uint16[o2 + 6] = v6;
            this.uint16[o2 + 7] = v7;
            this.uint16[o2 + 8] = v8;
            this.uint16[o2 + 9] = v9;
            this.uint16[o2 + 10] = v10;
            this.uint16[o2 + 11] = v11;
            this.uint16[o2 + 12] = v12;
            this.uint16[o2 + 13] = v13;
            this.uint16[o2 + 14] = v14;
            this.uint32[o4 + 8] = v15;
            this.float32[o4 + 9] = v16;
            this.float32[o4 + 10] = v17;
            return i;
        };

        return StructArrayLayout6i9ui1ul2f44;
    }(e));
    array.prototype.bytesPerElement = 44;
    f.StructArrayLayout6i9ui1ul2f44 = array;

    array = (function (StructArray) {
        function StructArrayLayout1ul2ui8() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout1ul2ui8.__proto__ = StructArray;
        StructArrayLayout1ul2ui8.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout1ul2ui8.prototype.constructor = StructArrayLayout1ul2ui8;

        StructArrayLayout1ul2ui8.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.uint32 = new Uint32Array(this.arrayBuffer);
            this.uint16 = new Uint16Array(this.arrayBuffer);
        };

        StructArrayLayout1ul2ui8.prototype.emplaceBack = function emplaceBack(v0, v1, v2) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2);
        };

        StructArrayLayout1ul2ui8.prototype.emplace = function emplace(i, v0, v1, v2) {
            var o4 = i * 2;
            var o2 = i * 4;
            this.uint32[o4 + 0] = v0;
            this.uint16[o2 + 2] = v1;
            this.uint16[o2 + 3] = v2;
            return i;
        };

        return StructArrayLayout1ul2ui8;
    }(e));
    array.prototype.bytesPerElement = 8;
    f.StructArrayLayout1ul2ui8 = array;

    array = (function (StructArray) {
        function StructArrayLayout2f4ib16() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2f4ib16.__proto__ = StructArray;
        StructArrayLayout2f4ib16.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2f4ib16.prototype.constructor = StructArrayLayout2f4ib16;

        StructArrayLayout2f4ib16.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout2f4ib16.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5);
        };

        StructArrayLayout2f4ib16.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5) {
            var o1 = i * 4;
            var o2 = i * 8;
            this.float32[o1 + 0] = v0;
            this.float32[o1 + 1] = v1;
            this.int16[o2 + 4] = v2;
            this.int16[o2 + 5] = v3;
            this.int16[o2 + 6] = v4;
            this.int16[o2 + 7] = v5;
            return i;
        };

        return StructArrayLayout2f4ib16;
    }(e));
    array.prototype.bytesPerElement = 16;
    f.StructArrayLayout2f4ib16 = array;


    array = (function (StructArray) {
        function StructArrayLayout2f2ib12() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2f2ib12.__proto__ = StructArray;
        StructArrayLayout2f2ib12.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2f2ib12.prototype.constructor = StructArrayLayout2f2ib12;

        StructArrayLayout2f2ib12.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout2f2ib12.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3);
        };

        StructArrayLayout2f2ib12.prototype.emplace = function emplace(i, v0, v1, v2, v3) {
            var o1 = i * 3;
            var o2 = i * 6;
            this.float32[o1 + 0] = v0;
            this.float32[o1 + 1] = v1;
            this.int16[o2 + 4] = v2;
            this.int16[o2 + 5] = v3;
            return i;
        };

        return StructArrayLayout2f2ib12;
    }(e));
    array.prototype.bytesPerElement = 12;
    f.StructArrayLayout2f2ib12 = array;

    array = function (StructArrayLayout6i1ul2ui2i24) {
        function CollisionBoxArray() {
            StructArrayLayout6i1ul2ui2i24.apply(this, arguments);
        }

        if (StructArrayLayout6i1ul2ui2i24) CollisionBoxArray.__proto__ = StructArrayLayout6i1ul2ui2i24;
        CollisionBoxArray.prototype = Object.create(StructArrayLayout6i1ul2ui2i24 && StructArrayLayout6i1ul2ui2i24.prototype);
        CollisionBoxArray.prototype.constructor = CollisionBoxArray;

        CollisionBoxArray.prototype.get = function get(index) {
            return new struct.CollisionBoxStruct(this, index);
        };

        return CollisionBoxArray;
    }(f.StructArrayLayout6i1ul2ui2i24);

    f.CollisionBoxArray = array;

    array = function (StructArrayLayout1f4) {
        function GlyphOffsetArray() {
            StructArrayLayout1f4.apply(this, arguments);
        }

        if (StructArrayLayout1f4) GlyphOffsetArray.__proto__ = StructArrayLayout1f4;
        GlyphOffsetArray.prototype = Object.create(StructArrayLayout1f4 && StructArrayLayout1f4.prototype);
        GlyphOffsetArray.prototype.constructor = GlyphOffsetArray;

        GlyphOffsetArray.prototype.getoffsetX = function getoffsetX(index) {
            return this.float32[index * 1 + 0];
        };
        /**
         * Return the GlyphOffsetStruct at the given location in the array.
         * @param {number} index The index of the element.
         */
        GlyphOffsetArray.prototype.get = function get(index) {
            return new GlyphOffsetStruct(this, index);
        };

        return GlyphOffsetArray;
    }(f.StructArrayLayout1f4);
    f.GlyphOffsetArray = array;

    var SymbolLineVertexArray = (function (StructArrayLayout3i6) {
        function SymbolLineVertexArray() {
            StructArrayLayout3i6.apply(this, arguments);
        }

        if (StructArrayLayout3i6) SymbolLineVertexArray.__proto__ = StructArrayLayout3i6;
        SymbolLineVertexArray.prototype = Object.create(StructArrayLayout3i6 && StructArrayLayout3i6.prototype);
        SymbolLineVertexArray.prototype.constructor = SymbolLineVertexArray;

        SymbolLineVertexArray.prototype.getx = function getx(index) {
            return this.int16[index * 3 + 0];
        };
        SymbolLineVertexArray.prototype.gety = function gety(index) {
            return this.int16[index * 3 + 1];
        };
        SymbolLineVertexArray.prototype.gettileUnitDistanceFromAnchor = function gettileUnitDistanceFromAnchor(index) {
            return this.int16[index * 3 + 2];
        };
        /**
         * Return the SymbolLineVertexStruct at the given location in the array.
         * @param {number} index The index of the element.
         */
        SymbolLineVertexArray.prototype.get = function get(index) {
            return new SymbolLineVertexStruct(this, index);
        };

        return SymbolLineVertexArray;
    }(f.StructArrayLayout3i6));
    f.SymbolLineVertexArray = SymbolLineVertexArray;

    array = (function (StructArrayLayout6i9ui1ul2f44) {
        function SymbolInstanceArray() {
            StructArrayLayout6i9ui1ul2f44.apply(this, arguments);
        }

        if (StructArrayLayout6i9ui1ul2f44) SymbolInstanceArray.__proto__ = StructArrayLayout6i9ui1ul2f44;
        SymbolInstanceArray.prototype = Object.create(StructArrayLayout6i9ui1ul2f44 && StructArrayLayout6i9ui1ul2f44.prototype);
        SymbolInstanceArray.prototype.constructor = SymbolInstanceArray;

        SymbolInstanceArray.prototype.get = function get(index) {
            return new struct.SymbolInstanceStruct(this, index);
        };

        return SymbolInstanceArray;
    }(f.StructArrayLayout6i9ui1ul2f44));
    f.SymbolInstanceArray = array;


    array = (function (StructArrayLayout1ul2ui8) {
        function FeatureIndexArray() {
            StructArrayLayout1ul2ui8.apply(this, arguments);
        }

        if (StructArrayLayout1ul2ui8) FeatureIndexArray.__proto__ = StructArrayLayout1ul2ui8;
        FeatureIndexArray.prototype = Object.create(StructArrayLayout1ul2ui8 && StructArrayLayout1ul2ui8.prototype);
        FeatureIndexArray.prototype.constructor = FeatureIndexArray;

        FeatureIndexArray.prototype.get = function get(index) {
            return new struct.FeatureIndexStruct(this, index);
        };

        return FeatureIndexArray;
    }(f.StructArrayLayout1ul2ui8));
    f.FeatureIndexArray = array;

    array = (function (StructArray) {
        function StructArrayLayout2f8() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2f8.__proto__ = StructArray;
        StructArrayLayout2f8.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2f8.prototype.constructor = StructArrayLayout2f8;

        StructArrayLayout2f8.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout2f8.prototype.emplaceBack = function emplaceBack(v0, v1) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1);
        };

        StructArrayLayout2f8.prototype.emplace = function emplace(i, v0, v1) {
            var o4 = i * 2;
            this.float32[o4 + 0] = v0;
            this.float32[o4 + 1] = v1;
            return i;
        };

        return StructArrayLayout2f8;
    }(e));

    array.prototype.bytesPerElement = 8;
    f.StructArrayLayout2f8 = array;

    array = (function (StructArray) {
        function StructArrayLayout5fb20() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout5fb20.__proto__ = StructArray;
        StructArrayLayout5fb20.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout5fb20.prototype.constructor = StructArrayLayout5fb20;

        StructArrayLayout5fb20.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout5fb20.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4);
        };

        StructArrayLayout5fb20.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4) {
            var o4 = i * 5;
            this.float32[o4 + 0] = v0;
            this.float32[o4 + 1] = v1;
            this.float32[o4 + 2] = v2;
            this.float32[o4 + 3] = v3;
            this.float32[o4 + 4] = v4;
            return i;
        };

        return StructArrayLayout5fb20;
    }(e));

    array.prototype.bytesPerElement = 20;
    f.StructArrayLayout5fb20 = array;

    array = (function (StructArray) {
        function StructArrayLayout4f16() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout4f16.__proto__ = StructArray;
        StructArrayLayout4f16.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout4f16.prototype.constructor = StructArrayLayout4f16;

        StructArrayLayout4f16.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.float32 = new Float32Array(this.arrayBuffer);
        };

        StructArrayLayout4f16.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3);
        };

        StructArrayLayout4f16.prototype.emplace = function emplace(i, v0, v1, v2, v3) {
            var o4 = i * 4;
            this.float32[o4 + 0] = v0;
            this.float32[o4 + 1] = v1;
            this.float32[o4 + 2] = v2;
            this.float32[o4 + 3] = v3;
            return i;
        };

        return StructArrayLayout4f16;
    }(e));

    array.prototype.bytesPerElement = 16;
    f.StructArrayLayout4f16 = array;

    array = (function (StructArray) {
        function StructArrayLayout8ui16() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout8ui16.__proto__ = StructArray;
        StructArrayLayout8ui16.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout8ui16.prototype.constructor = StructArrayLayout8ui16;

        StructArrayLayout8ui16.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.uint16 = new Uint16Array(this.arrayBuffer);
        };

        StructArrayLayout8ui16.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5, v6, v7);
        };

        StructArrayLayout8ui16.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5, v6, v7) {
            var o2 = i * 8;
            this.uint16[o2 + 0] = v0;
            this.uint16[o2 + 1] = v1;
            this.uint16[o2 + 2] = v2;
            this.uint16[o2 + 3] = v3;
            this.uint16[o2 + 4] = v4;
            this.uint16[o2 + 5] = v5;
            this.uint16[o2 + 6] = v6;
            this.uint16[o2 + 7] = v7;
            return i;
        };

        return StructArrayLayout8ui16;
    }(e));

    array.prototype.bytesPerElement = 16;
    f.StructArrayLayout8ui16 = array;

    f.PlacedSymbolArray = function (StructArrayLayout2i2ui3ul3ui2f2ub1ul44) {
        function PlacedSymbolArray() {
            StructArrayLayout2i2ui3ul3ui2f2ub1ul44.apply(this, arguments);
        }

        if (StructArrayLayout2i2ui3ul3ui2f2ub1ul44) PlacedSymbolArray.__proto__ = StructArrayLayout2i2ui3ul3ui2f2ub1ul44;
        PlacedSymbolArray.prototype = Object.create(StructArrayLayout2i2ui3ul3ui2f2ub1ul44 && StructArrayLayout2i2ui3ul3ui2f2ub1ul44.prototype);
        PlacedSymbolArray.prototype.constructor = PlacedSymbolArray;
        PlacedSymbolArray.prototype.get = function get(index) {
            return new struct.PlacedSymbolStruct(this, index);
        };
        return PlacedSymbolArray;
    }(f.StructArrayLayout2i2ui3ul3ui2f2ub1ul44);

    array = (function (StructArray) {
        function StructArrayLayout2i4i12() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout2i4i12.__proto__ = StructArray;
        StructArrayLayout2i4i12.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout2i4i12.prototype.constructor = StructArrayLayout2i4i12;

        StructArrayLayout2i4i12.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
        };

        StructArrayLayout2i4i12.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3, v4, v5) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3, v4, v5);
        };

        StructArrayLayout2i4i12.prototype.emplace = function emplace(i, v0, v1, v2, v3, v4, v5) {
            var o2 = i * 6;
            this.int16[o2 + 0] = v0;
            this.int16[o2 + 1] = v1;
            this.int16[o2 + 2] = v2;
            this.int16[o2 + 3] = v3;
            this.int16[o2 + 4] = v4;
            this.int16[o2 + 5] = v5;
            return i;
        };

        return StructArrayLayout2i4i12;
    }(e));
    array.prototype.bytesPerElement = 12;
    f.StructArrayLayout2i4i12 = array;

    array = (function (StructArray) {
        function StructArrayLayout4i8() {
            StructArray.apply(this, arguments);
        }

        if (StructArray) StructArrayLayout4i8.__proto__ = StructArray;
        StructArrayLayout4i8.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayLayout4i8.prototype.constructor = StructArrayLayout4i8;

        StructArrayLayout4i8.prototype._refreshViews = function _refreshViews() {
            this.uint8 = new Uint8Array(this.arrayBuffer);
            this.int16 = new Int16Array(this.arrayBuffer);
        };

        StructArrayLayout4i8.prototype.emplaceBack = function emplaceBack(v0, v1, v2, v3) {
            var i = this.length;
            this.resize(i + 1);
            return this.emplace(i, v0, v1, v2, v3);
        };

        StructArrayLayout4i8.prototype.emplace = function emplace(i, v0, v1, v2, v3) {
            var o2 = i * 4;
            this.int16[o2 + 0] = v0;
            this.int16[o2 + 1] = v1;
            this.int16[o2 + 2] = v2;
            this.int16[o2 + 3] = v3;
            return i;
        };
        return StructArrayLayout4i8;
    }(e));

    array.prototype.bytesPerElement = 8;
    f.StructArrayLayout4i8 = array;


});