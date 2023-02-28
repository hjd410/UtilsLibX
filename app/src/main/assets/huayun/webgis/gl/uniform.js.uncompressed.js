define("com/huayun/webgis/gl/uniform", [
    "exports",
    "../utils/Color"
], function (exports, Color) {
    var Uniform = function Uniform(context, location) {
        this.gl = context.gl;
        this.location = location;
    };

    var Uniform1i = (function (Uniform) {
        function Uniform1i(context, location) {
            Uniform.call(this, context, location);
            this.current = 0;
        }
        if (Uniform) Uniform1i.__proto__ = Uniform;
        Uniform1i.prototype = Object.create(Uniform && Uniform.prototype);
        Uniform1i.prototype.constructor = Uniform1i;
        Uniform1i.prototype.set = function set(v) {
            if (this.current !== v) {
                this.current = v;
                this.gl.uniform1i(this.location, v);
            }
        };
        return Uniform1i;
    }(Uniform));

    var Uniform1f = (function (Uniform) {
        function Uniform1f(context, location) {
            Uniform.call(this, context, location);
            this.current = 0;
        }

        if (Uniform) Uniform1f.__proto__ = Uniform;
        Uniform1f.prototype = Object.create(Uniform && Uniform.prototype);
        Uniform1f.prototype.constructor = Uniform1f;

        Uniform1f.prototype.set = function set(v) {
            if (this.current !== v) {
                this.current = v;
                this.gl.uniform1f(this.location, v);
            }
        };

        return Uniform1f;
    }(Uniform));

    var Uniform2f = (function (Uniform) {
        function Uniform2f(context, location) {
            Uniform.call(this, context, location);
            this.current = [0, 0];
        }

        if (Uniform) Uniform2f.__proto__ = Uniform;
        Uniform2f.prototype = Object.create(Uniform && Uniform.prototype);
        Uniform2f.prototype.constructor = Uniform2f;

        Uniform2f.prototype.set = function set(v) {
            if (v[0] !== this.current[0] || v[1] !== this.current[1]) {
                this.current = v;
                this.gl.uniform2f(this.location, v[0], v[1]);
            }
        };

        return Uniform2f;
    }(Uniform));

    var Uniform3f = (function (Uniform) {
        function Uniform3f(context, location) {
            Uniform.call(this, context, location);
            this.current = [0, 0, 0];
        }

        if (Uniform) Uniform3f.__proto__ = Uniform;
        Uniform3f.prototype = Object.create(Uniform && Uniform.prototype);
        Uniform3f.prototype.constructor = Uniform3f;

        Uniform3f.prototype.set = function set(v) {
            if (v[0] !== this.current[0] || v[1] !== this.current[1] || v[2] !== this.current[2]) {
                this.current = v;
                this.gl.uniform3f(this.location, v[0], v[1], v[2]);
            }
        };

        return Uniform3f;
    }(Uniform));

    var Uniform4f = (function (Uniform) {
        function Uniform4f(context, location) {
            Uniform.call(this, context, location);
            this.current = [0, 0, 0, 0];
        }

        if (Uniform) Uniform4f.__proto__ = Uniform;
        Uniform4f.prototype = Object.create(Uniform && Uniform.prototype);
        Uniform4f.prototype.constructor = Uniform4f;

        Uniform4f.prototype.set = function set(v) {
            if (v[0] !== this.current[0] || v[1] !== this.current[1] ||
                v[2] !== this.current[2] || v[3] !== this.current[3]) {
                this.current = v;
                this.gl.uniform4f(this.location, v[0], v[1], v[2], v[3]);
            }
        };

        return Uniform4f;
    }(Uniform));

    var UniformColor = (function (Uniform) {
        function UniformColor(context, location) {
            Uniform.call(this, context, location);
            this.current = Color.transparent;
        }

        if (Uniform) UniformColor.__proto__ = Uniform;
        UniformColor.prototype = Object.create(Uniform && Uniform.prototype);
        UniformColor.prototype.constructor = UniformColor;

        UniformColor.prototype.set = function set(v) {
            if (v.r !== this.current.r || v.g !== this.current.g ||
                v.b !== this.current.b || v.a !== this.current.a) {
                this.current = v;
                this.gl.uniform4f(this.location, v.r, v.g, v.b, v.a);
            }
        };

        return UniformColor;
    }(Uniform));

    var emptyMat4 = new Float32Array(16);
    var UniformMatrix4f = (function (Uniform) {
        function UniformMatrix4f(context, location) {
            Uniform.call(this, context, location);
            this.current = emptyMat4;
        }

        if (Uniform) UniformMatrix4f.__proto__ = Uniform;
        UniformMatrix4f.prototype = Object.create(Uniform && Uniform.prototype);
        UniformMatrix4f.prototype.constructor = UniformMatrix4f;

        UniformMatrix4f.prototype.set = function set(v) {
            if (v[12] !== this.current[12] || v[0] !== this.current[0]) {
                this.current = v;
                this.gl.uniformMatrix4fv(this.location, false, v);
                return;
            }
            for (var i = 1; i < 16; i++) {
                if (v[i] !== this.current[i]) {
                    this.current = v;
                    this.gl.uniformMatrix4fv(this.location, false, v);
                    break;
                }
            }
        };

        return UniformMatrix4f;
    }(Uniform));

    exports.Uniform1f = Uniform1f;
    exports.Uniform1i = Uniform1i;
    exports.Uniform2f = Uniform2f;
    exports.Uniform3f = Uniform3f;
    exports.Uniform4f = Uniform4f;
    exports.UniformMatrix4f = UniformMatrix4f;
    exports.UniformColor = UniformColor;
});