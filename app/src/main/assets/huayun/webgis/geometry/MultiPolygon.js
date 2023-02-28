//>>built
define("com/huayun/webgis/geometry/MultiPolygon",["./Geometry","./Extent"],function(_1,_2){function _3(_4){var _5=_4[0];var _6=_5.extent.xmin;var _7=_5.extent.ymin;var _8=_5.extent.xmax;var _9=_5.extent.ymax;for(var i=1,_a=_4.length;i<_a;i++){var _b=_4[i];if(_6>_b.extent.xmin){_6=_b.extent.xmin;}if(_7>_b.extent.ymin){_7=_b.extent.ymin;}if(_8<_b.extent.xmax){_8=_b.extent.xmax;}if(_9<_b.extent.ymax){_9=_b.extent.ymax;}}return {xmin:_6,ymin:_7,xmax:_8,ymax:_9};};function _c(_d){var _e=_d.polygons;var _f=0,_10=-1;_e.forEach(function(_11,_12){if(_11.area>_f){_f=_11.area;_10=_12;}});return _10;};var _13=function(_14,_15){_1.call(this);this.type="multipolygon";this.polygons=_14;this.spatialReference=_15;this._extent=null;};if(_1){_13.__proto__=_1;}_13.prototype=Object.create(_1&&_1.prototype);_13.prototype.constructor=_13;var _16={length:{configurable:false},extent:{configurable:false}};_16.length.get=function(){return this.path.length;};_16.extent.get=function(){if(!this._extent){var _17=_3(this.polygons);this._extent=new _2(_17.xmin,_17.ymin,_17.xmax,_17.ymax);}return this._extent;};_13.prototype={setPath:function(_18){this.path=_18;this._extent=null;},addRing:function(_19){this.path.push(_19);this._extent=null;},update:function(dx,dy){this.path.forEach(function(_1a){_1a.forEach(function(_1b){_1b.update(dx,dy);});});this._extent=null;},_getMaxAreaIndex:function(){return _c(this);},getMaxAreaPolygon:function(){var _1c=this._getMaxAreaIndex();return this.polygons[_1c];}};Object.defineProperties(_13.prototype,_16);return _13;});