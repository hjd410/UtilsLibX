//>>built
define("com/huayun/webgis/work/support/VectorTile",["./VectorTileLayer"],function(_1){function _2(_3,_4){this.layers=_3.readFields(_5,{},_4);};function _5(_6,_7,_8){if(_6===3){var _9=new _1(_8,_8.readVarint()+_8.pos);if(_9.length){_7[_9.name]=_9;}}};return _2;});