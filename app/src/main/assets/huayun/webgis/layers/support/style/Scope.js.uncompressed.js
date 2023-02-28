/**
 * 表达式解析过程中跟踪let绑定
 */
define("com/huayun/webgis/layers/support/style/Scope", [], function () {
    function Scope(parent, bindings) {
        if (bindings === void 0) bindings = [];
        this.parent = parent;
        this.bindings = {};
        for (var i = 0, list = bindings; i < list.length; i += 1) {
            var ref = list[i];
            var name = ref[0];
            this.bindings[name] = ref[1];
        }
    }

    Scope.prototype.concat = function concat(bindings) {
        return new Scope(this, bindings);
    };

    Scope.prototype.get = function get(name) {
        if (this.bindings[name]) {
            return this.bindings[name];
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error((name + " not found in scope."));
    };

    Scope.prototype.has = function has(name) {
        if (this.bindings[name]) {
            return true;
        }
        return this.parent ? this.parent.has(name) : false;
    };

    return Scope;
});