//>>built
define("com/huayun/webgis/gl/uniform",["exports","../utils/Color"],function(_1,_2){var _3=function _3(_4,_5){this.gl=_4.gl;this.location=_5;};var _6=(function(_7){function _6(_8,_9){_7.call(this,_8,_9);this.current=0;};if(_7){_6.__proto__=_7;}_6.prototype=Object.create(_7&&_7.prototype);_6.prototype.constructor=_6;_6.prototype.set=function set(v){if(this.current!==v){this.current=v;this.gl.uniform1i(this.location,v);}};return _6;}(_3));var _a=(function(_b){function _a(_c,_d){_b.call(this,_c,_d);this.current=0;};if(_b){_a.__proto__=_b;}_a.prototype=Object.create(_b&&_b.prototype);_a.prototype.constructor=_a;_a.prototype.set=function set(v){if(this.current!==v){this.current=v;this.gl.uniform1f(this.location,v);}};return _a;}(_3));var _e=(function(_f){function _e(_10,_11){_f.call(this,_10,_11);this.current=[0,0];};if(_f){_e.__proto__=_f;}_e.prototype=Object.create(_f&&_f.prototype);_e.prototype.constructor=_e;_e.prototype.set=function set(v){if(v[0]!==this.current[0]||v[1]!==this.current[1]){this.current=v;this.gl.uniform2f(this.location,v[0],v[1]);}};return _e;}(_3));var _12=(function(_13){function _12(_14,_15){_13.call(this,_14,_15);this.current=[0,0,0];};if(_13){_12.__proto__=_13;}_12.prototype=Object.create(_13&&_13.prototype);_12.prototype.constructor=_12;_12.prototype.set=function set(v){if(v[0]!==this.current[0]||v[1]!==this.current[1]||v[2]!==this.current[2]){this.current=v;this.gl.uniform3f(this.location,v[0],v[1],v[2]);}};return _12;}(_3));var _16=(function(_17){function _16(_18,_19){_17.call(this,_18,_19);this.current=[0,0,0,0];};if(_17){_16.__proto__=_17;}_16.prototype=Object.create(_17&&_17.prototype);_16.prototype.constructor=_16;_16.prototype.set=function set(v){if(v[0]!==this.current[0]||v[1]!==this.current[1]||v[2]!==this.current[2]||v[3]!==this.current[3]){this.current=v;this.gl.uniform4f(this.location,v[0],v[1],v[2],v[3]);}};return _16;}(_3));var _1a=(function(_1b){function _1a(_1c,_1d){_1b.call(this,_1c,_1d);this.current=_2.transparent;};if(_1b){_1a.__proto__=_1b;}_1a.prototype=Object.create(_1b&&_1b.prototype);_1a.prototype.constructor=_1a;_1a.prototype.set=function set(v){if(v.r!==this.current.r||v.g!==this.current.g||v.b!==this.current.b||v.a!==this.current.a){this.current=v;this.gl.uniform4f(this.location,v.r,v.g,v.b,v.a);}};return _1a;}(_3));var _1e=new Float32Array(16);var _1f=(function(_20){function _1f(_21,_22){_20.call(this,_21,_22);this.current=_1e;};if(_20){_1f.__proto__=_20;}_1f.prototype=Object.create(_20&&_20.prototype);_1f.prototype.constructor=_1f;_1f.prototype.set=function set(v){if(v[12]!==this.current[12]||v[0]!==this.current[0]){this.current=v;this.gl.uniformMatrix4fv(this.location,false,v);return;}for(var i=1;i<16;i++){if(v[i]!==this.current[i]){this.current=v;this.gl.uniformMatrix4fv(this.location,false,v);break;}}};return _1f;}(_3));_1.Uniform1f=_a;_1.Uniform1i=_6;_1.Uniform2f=_e;_1.Uniform3f=_12;_1.Uniform4f=_16;_1.UniformMatrix4f=_1f;_1.UniformColor=_1a;});