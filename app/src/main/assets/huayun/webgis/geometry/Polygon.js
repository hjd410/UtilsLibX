//>>built
define("com/huayun/webgis/geometry/Polygon",["./Geometry","./Extent"],function(_1,_2){function _3(_4){var _5,_6,_7,_8;_5=_7=_4[0][0].x;_6=_8=_4[0][0].y;var _9=_4.length;for(var i=0;i<_9;i++){var _a=_4[i];var ll=_a.length;for(var j=0;j<ll;j++){var p=_a[j];_5=Math.min(_5,p.x);_6=Math.min(_6,p.y);_7=Math.max(_7,p.x);_8=Math.max(_8,p.y);}}return {xmin:_5,ymin:_6,xmax:_7,ymax:_8};};var _b=function(_c,_d){_1.call(this);this.type="polygon";this.path=_c;this.spatialReference=_d;this._extent=null;this._area=null;};if(_1){_b.__proto__=_1;}_b.prototype=Object.create(_1&&_1.prototype);_b.prototype.constructor=_b;var _e={length:{configurable:false},extent:{configurable:false},area:{configurable:false}};_e.length.get=function(){return this.path.length;};_e.extent.get=function(){if(!this._extent){var _f=_3(this.path);this._extent=new _2(_f.xmin,_f.ymin,_f.xmax,_f.ymax);}return this._extent;};_e.area.get=function(){if(!this._area){this._area=this.calculateArea();}return this._area;};_b.prototype={setPath:function(_10){this.path=_10;this._extent=null;},addRing:function(_11){this.path.push(_11);this._extent=null;},update:function(dx,dy){this.path.forEach(function(_12){_12.forEach(function(_13){_13.update(dx,dy);});});this._extent=null;},calculateArea:function(){var _14=0,_15=0;var _16=this.path;for(var i=0;i<_16.length;i++){var _17=_16[i];for(var j=0;j<_17.length-1;j++){_14=0.5*(_17[j+1].x-_17[j].x)*(_17[j+1].y+_17[j].y);_15+=_14;}_14=0.5*(_17[0].x-_17[_17.length-1].x)*(_17[0].y+_17[_17.length-1].y);_15+=_14;}return Math.abs(_15);}};Object.defineProperties(_b.prototype,_e);return _b;});