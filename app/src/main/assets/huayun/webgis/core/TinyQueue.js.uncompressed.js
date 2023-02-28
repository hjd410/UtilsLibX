define("com/huayun/webgis/core/TinyQueue", [], function () {
    function defaultCompare$1(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    var TinyQueue = function TinyQueue(data, compare) {
        if (data === void 0) data = [];
        if (compare === void 0) compare = defaultCompare$1;
        this.data = data;
        this.length = this.data.length;
        this.compare = compare;
        if (this.length > 0) {
            for (var i = (this.length >> 1) - 1; i >= 0; i--) {
                this._down(i);
            }
        }
    };

    TinyQueue.prototype.push = function push(item) {
        this.data.push(item);
        this.length++;
        this._up(this.length - 1);
    };

    TinyQueue.prototype.pop = function pop() {
        if (this.length === 0) {
            return undefined;
        }
        var top = this.data[0];
        this.length--;
        if (this.length > 0) {
            this.data[0] = this.data[this.length];
            this._down(0);
        }
        this.data.pop();
        return top;
    };

    TinyQueue.prototype.peek = function peek() {
        return this.data[0];
    };

    TinyQueue.prototype._up = function _up(pos) {
        var ref = this;
        var data = ref.data;
        var compare = ref.compare;
        var item = data[pos];
        while (pos > 0) {
            var parent = (pos - 1) >> 1;
            var current = data[parent];
            if (compare(item, current) >= 0) {
                break;
            }
            data[pos] = current;
            pos = parent;
        }

        data[pos] = item;
    };

    TinyQueue.prototype._down = function _down(pos) {
        var ref = this;
        var data = ref.data;
        var compare = ref.compare;
        var halfLength = this.length >> 1;
        var item = data[pos];

        while (pos < halfLength) {
            var left = (pos << 1) + 1;
            var best = data[left];
            var right = left + 1;

            if (right < this.length && compare(data[right], best) < 0) {
                left = right;
                best = data[right];
            }
            if (compare(best, item) >= 0) {
                break;
            }

            data[pos] = best;
            pos = left;
        }

        data[pos] = item;
    };

    return TinyQueue;
})